package tcucl.back_tcucl.service.impl;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import tcucl.back_tcucl.dto.SyntheseEGESResultatDto;
import tcucl.back_tcucl.entity.Entite;
import tcucl.back_tcucl.service.EntiteService;
import tcucl.back_tcucl.service.SyntheseEGESService;
import tcucl.back_tcucl.service.SyntheseEgesExcelExportService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SyntheseEgesExcelExportServiceImpl implements SyntheseEgesExcelExportService {

    private final SyntheseEGESService syntheseEGESService;
    private final EntiteService entiteService;

    public SyntheseEgesExcelExportServiceImpl(SyntheseEGESService syntheseEGESService, EntiteService entiteService) {
        this.syntheseEGESService = syntheseEGESService;
        this.entiteService = entiteService;
    }

    @Override
    public byte[] exportSyntheseExcel(Long entiteId, Integer annee) {
        Entite entite = entiteService.getEntiteById(entiteId);
        SyntheseEGESResultatDto dto = syntheseEGESService.getSyntheseEGESResultat(entiteId, annee);

        String entiteNom = entite != null && entite.getNom() != null ? entite.getNom() : ("Entité #" + entiteId);
        String entiteType = entite != null && entite.getType() != null ? entite.getType() : "";
        String anneeLabel = (annee != null) ? ((annee - 1) + "-" + annee) : "";
        String dateExport = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Styles styles = new Styles(workbook);

            buildSyntheseSheet(workbook, styles, entiteNom, entiteType, anneeLabel, dateExport, dto);
            buildBegesSheet(workbook, styles, entiteNom, entiteType, anneeLabel, dateExport, dto);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Erreur lors de la génération de l'export Excel EGES", e);
        }
    }

    private void buildSyntheseSheet(
            XSSFWorkbook workbook,
            Styles styles,
            String entiteNom,
            String entiteType,
            String anneeLabel,
            String dateExport,
            SyntheseEGESResultatDto dto) {
        Sheet sheet = workbook.createSheet("Synthèse par poste");

        int rowIdx = writeMetadataBlock(
                sheet, styles,
                "Bilan des émissions de gaz à effet de serre — Synthèse par poste",
                entiteNom, entiteType, anneeLabel, dateExport);

        // Tableau 1 : Postes d'émission
        Row header = sheet.createRow(rowIdx++);
        createCell(header, 0, "Poste d'émission", styles.header);
        createCell(header, 1, "Émissions globales (tCO₂e)", styles.header);
        createCell(header, 2, "Émissions par usager (kgCO₂e/usager)", styles.header);
        createCell(header, 3, "Part du total (%)", styles.header);

        double totalGlobal = safeDouble(dto.getBilanCarboneTotalGlobal());

        List<SectorRow> sectors = List.of(
                new SectorRow("Émissions fugitives", dto.getEmissionFugitivesGlobal(), dto.getEmissionFugitivesParUsager()),
                new SectorRow("Énergie", dto.getEnergieGlobal(), dto.getEnergieParUsager()),
                new SectorRow("Déplacements domicile - travail", dto.getMobiliteDomicileTravailGlobal(), dto.getMobiliteDomicileTravailParUsager()),
                new SectorRow("Autres déplacements France", dto.getAutreMobiliteFrGlobal(), dto.getAutreMobiliteFrParUsager()),
                new SectorRow("Déplacements internationaux", dto.getMobiliteInternationalGlobal(), dto.getMobiliteInternationalParUsager()),
                new SectorRow("Bâtiments, mobilier et parkings", dto.getBatimentParkingGlobal(), dto.getBatimentParkingParUsager()),
                new SectorRow("Numérique", dto.getNumeriqueGlobal(), dto.getNumeriqueParUsager()),
                new SectorRow("Autres immobilisations", dto.getAutreImmobilisationGlobal(), dto.getAutreImmobilisationParUsager()),
                new SectorRow("Achats", dto.getAchatGlobal(), dto.getAchatParUsager()),
                new SectorRow("Déchets", dto.getDechetGlobal(), dto.getDechetParUsager())
        );

        for (SectorRow s : sectors) {
            Row r = sheet.createRow(rowIdx++);
            double val = safeDouble(s.global);
            double share = totalGlobal > 0 ? (val / totalGlobal) * 100.0 : 0.0;
            createCell(r, 0, s.label, styles.text);
            createNumericCell(r, 1, val, styles.number);
            createNullableNumericCell(r, 2, s.parUsager, styles.number);
            createNumericCell(r, 3, share, styles.percentNumber);
        }

        Row totalRow = sheet.createRow(rowIdx++);
        createCell(totalRow, 0, "Bilan carbone total", styles.totalText);
        createNumericCell(totalRow, 1, totalGlobal, styles.totalNumber);
        createNullableNumericCell(totalRow, 2, dto.getBilanCarboneTotalParUsager(), styles.totalNumber);
        createNumericCell(totalRow, 3, totalGlobal > 0 ? 100.0 : 0.0, styles.totalNumber);

        Row eviteeRow = sheet.createRow(rowIdx++);
        createCell(eviteeRow, 0, "Émissions évitées (déchets)", styles.text);
        createNumericCell(eviteeRow, 1, safeDouble(dto.getEmissionEvitee()), styles.number);
        createCell(eviteeRow, 2, "—", styles.textCenter);
        createCell(eviteeRow, 3, "—", styles.textCenter);

        rowIdx++; // Ligne vide

        // Tableau 2 : Indicateurs de surface et d'intensité
        Row indHeader = sheet.createRow(rowIdx++);
        createCell(indHeader, 0, "Indicateur", styles.header);
        createCell(indHeader, 1, "Valeur", styles.header);
        createCell(indHeader, 2, "Unité", styles.header);

        addIndicatorRow(sheet, rowIdx++, styles, "Effectif total (étudiants + salariés)", dto.getEffectifTotal() != null ? dto.getEffectifTotal().doubleValue() : null, "usagers", true);
        addIndicatorRow(sheet, rowIdx++, styles, "Surface totale des campus / bâtiments", dto.getSurfaceTotaleBatiments(), "m²", false);
        addIndicatorRow(sheet, rowIdx++, styles, "Bilan carbone par usager", dto.getBilanCarboneTotalParUsager(), "kgCO₂e/usager", false);
        addIndicatorRow(sheet, rowIdx++, styles, "Bilan carbone par m²", dto.getBilanCarboneTotalParM2(), "kgCO₂e/m²", false);
        addIndicatorRow(sheet, rowIdx++, styles, "Consommation d'énergie finale par m²", dto.getConsoEnergieFinaleParM2(), "kWh/m²", false);
        addIndicatorRow(sheet, rowIdx++, styles, "Consommation d'énergie primaire par m²", dto.getConsoEnergiePrimaireParM2(), "kWh/m²", false);
        addIndicatorRow(sheet, rowIdx, styles, "Intensité carbone de l'énergie par m²", dto.getIntensiteCarboneParM2(), "kgCO₂e/m²", false);

        autoSizeColumns(sheet, 4);
    }

    private void buildBegesSheet(
            XSSFWorkbook workbook,
            Styles styles,
            String entiteNom,
            String entiteType,
            String anneeLabel,
            String dateExport,
            SyntheseEGESResultatDto dto) {
        Sheet sheet = workbook.createSheet("Bilan BEGES (Scopes)");

        int rowIdx = writeMetadataBlock(
                sheet, styles,
                "Bilan BEGES réglementaire — Répartition par scope et poste",
                entiteNom, entiteType, anneeLabel, dateExport);

        Row header = sheet.createRow(rowIdx++);
        createCell(header, 0, "Catégorie / Scope", styles.header);
        createCell(header, 1, "Poste BEGES", styles.header);
        createCell(header, 2, "Émissions (tCO₂e)", styles.header);

        // Scope 1
        rowIdx = writeBegesGroup(sheet, rowIdx, styles,
                "Scope 1 — Émissions directes",
                List.of(
                        new BegesRow("Émissions directes des sources fixes de combustion", dto.getEmissionDirecteCombustion()),
                        new BegesRow("Émissions directes des sources mobiles à moteur thermique", dto.getEmissionDirecteMoteurThermique()),
                        new BegesRow("Émissions directes des procédés hors énergie", 0.0f),
                        new BegesRow("Émissions directes fugitives", dto.getEmissionDirecteFugitives()),
                        new BegesRow("Émissions issues de la biomasse (sols et forêts)", 0.0f)
                ));

        // Scope 2
        rowIdx = writeBegesGroup(sheet, rowIdx, styles,
                "Scope 2 — Émissions indirectes associées à l'énergie",
                List.of(
                        new BegesRow("Émissions indirectes liées à la consommation d'électricité", dto.getEmissionIndirecteConsoElec()),
                        new BegesRow("Émissions indirectes liées à la consommation de vapeur, chaleur, froid", dto.getEmissionIndirecteConsoVapeurChaleurFroid())
                ));

        // Scope 3
        rowIdx = writeBegesGroup(sheet, rowIdx, styles,
                "Scope 3 — Autres émissions indirectes",
                List.of(
                        new BegesRow("Émissions liées à l'énergie non incluse dans les catégories directes / indirectes", dto.getEmissionNonIncluseDansDirectOuIndirecte()),
                        new BegesRow("Achats de produits ou services", dto.getAchatProduitOuService()),
                        new BegesRow("Immobilisations de biens", dto.getImmobilisationBien()),
                        new BegesRow("Déchets", dto.getDechet()),
                        new BegesRow("Transport de marchandise amont", 0.0f),
                        new BegesRow("Déplacements professionnels", dto.getDeplacementProfessionnel()),
                        new BegesRow("Actifs en leasing amont", 0.0f),
                        new BegesRow("Investissements", 0.0f),
                        new BegesRow("Transport de visiteurs et de clients", 0.0f),
                        new BegesRow("Transport de marchandise aval", 0.0f),
                        new BegesRow("Utilisation des produits vendus", 0.0f),
                        new BegesRow("Fin de vie des produits vendus", 0.0f),
                        new BegesRow("Franchise aval", 0.0f),
                        new BegesRow("Leasing aval", 0.0f),
                        new BegesRow("Déplacements domicile-travail", dto.getDeplacementDomicileTravail()),
                        new BegesRow("Autres émissions indirectes", 0.0f)
                ));

        Row totalRow = sheet.createRow(rowIdx++);
        createCell(totalRow, 0, "TOTAL BEGES", styles.totalText);
        createCell(totalRow, 1, "Bilan carbone total (Scopes 1 + 2 + 3)", styles.totalText);
        createNumericCell(totalRow, 2, safeDouble(dto.getBilanCarboneTotalScope()), styles.totalNumber);

        Row eviteeRow = sheet.createRow(rowIdx);
        createCell(eviteeRow, 0, "Hors bilan", styles.text);
        createCell(eviteeRow, 1, "Émissions évitées", styles.text);
        createNumericCell(eviteeRow, 2, safeDouble(dto.getEmissionEvitee()), styles.number);

        autoSizeColumns(sheet, 3);
    }

    private int writeMetadataBlock(
            Sheet sheet,
            Styles styles,
            String title,
            String entiteNom,
            String entiteType,
            String anneeLabel,
            String dateExport) {
        int r = 0;
        Row titleRow = sheet.createRow(r++);
        createCell(titleRow, 0, title, styles.title);

        Row entiteRow = sheet.createRow(r++);
        createCell(entiteRow, 0, "Établissement", styles.metaLabel);
        createCell(entiteRow, 1, entiteType.isBlank() ? entiteNom : (entiteNom + " (" + entiteType + ")"), styles.metaValue);

        Row anneeRow = sheet.createRow(r++);
        createCell(anneeRow, 0, "Année universitaire", styles.metaLabel);
        createCell(anneeRow, 1, anneeLabel, styles.metaValue);

        Row dateRow = sheet.createRow(r++);
        createCell(dateRow, 0, "Date d'export", styles.metaLabel);
        createCell(dateRow, 1, dateExport, styles.metaValue);

        r++; // Ligne vide
        return r;
    }

    private int writeBegesGroup(Sheet sheet, int rowIdx, Styles styles, String groupTitle, List<BegesRow> rows) {
        double subtotal = 0.0;
        for (BegesRow item : rows) {
            double val = safeDouble(item.value);
            subtotal += val;
            Row r = sheet.createRow(rowIdx++);
            createCell(r, 0, groupTitle, styles.text);
            createCell(r, 1, item.label, styles.text);
            createNumericCell(r, 2, val, styles.number);
        }
        Row subRow = sheet.createRow(rowIdx++);
        createCell(subRow, 0, groupTitle, styles.subtotalText);
        createCell(subRow, 1, "Sous-total", styles.subtotalText);
        createNumericCell(subRow, 2, subtotal, styles.subtotalNumber);
        return rowIdx;
    }

    private void addIndicatorRow(Sheet sheet, int rowIdx, Styles styles, String label, Number value, String unit, boolean integerFormat) {
        Row r = sheet.createRow(rowIdx);
        createCell(r, 0, label, styles.text);
        if (value != null && Double.isFinite(value.doubleValue())) {
            createNumericCell(r, 1, value.doubleValue(), integerFormat ? styles.intNumber : styles.number);
        } else {
            createCell(r, 1, "—", styles.textCenter);
        }
        createCell(r, 2, unit, styles.text);
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value != null ? value : "");
        c.setCellStyle(style);
    }

    private void createNumericCell(Row row, int col, double value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(Double.isFinite(value) ? value : 0.0);
        c.setCellStyle(style);
    }

    private void createNullableNumericCell(Row row, int col, Float value, CellStyle style) {
        if (value == null || !Float.isFinite(value)) {
            createCell(row, col, "—", style);
        } else {
            createNumericCell(row, col, value.doubleValue(), style);
        }
    }

    private double safeDouble(Float value) {
        return (value != null && Float.isFinite(value)) ? value.doubleValue() : 0.0;
    }

    private void autoSizeColumns(Sheet sheet, int colCount) {
        for (int i = 0; i < colCount; i++) {
            sheet.autoSizeColumn(i);
            int width = sheet.getColumnWidth(i) + 600;
            sheet.setColumnWidth(i, Math.min(Math.max(width, 3500), 18000));
        }
    }

    private record SectorRow(String label, Float global, Float parUsager) {}

    private record BegesRow(String label, Float value) {}

    private static class Styles {
        final CellStyle title;
        final CellStyle metaLabel;
        final CellStyle metaValue;
        final CellStyle header;
        final CellStyle text;
        final CellStyle textCenter;
        final CellStyle number;
        final CellStyle percentNumber;
        final CellStyle intNumber;
        final CellStyle subtotalText;
        final CellStyle subtotalNumber;
        final CellStyle totalText;
        final CellStyle totalNumber;

        Styles(Workbook wb) {
            DataFormat df = wb.createDataFormat();
            short decFmt = df.getFormat("#,##0.00");
            short intFmt = df.getFormat("#,##0");

            Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 13);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
            title = wb.createCellStyle();
            title.setFont(titleFont);

            Font boldFont = wb.createFont();
            boldFont.setBold(true);

            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            metaLabel = wb.createCellStyle();
            metaLabel.setFont(boldFont);

            metaValue = wb.createCellStyle();

            header = wb.createCellStyle();
            header.setFont(headerFont);
            header.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            header.setAlignment(HorizontalAlignment.LEFT);
            setThinBorders(header);

            text = wb.createCellStyle();
            setThinBorders(text);

            textCenter = wb.createCellStyle();
            textCenter.setAlignment(HorizontalAlignment.CENTER);
            setThinBorders(textCenter);

            number = wb.createCellStyle();
            number.setDataFormat(decFmt);
            number.setAlignment(HorizontalAlignment.RIGHT);
            setThinBorders(number);

            percentNumber = wb.createCellStyle();
            percentNumber.setDataFormat(decFmt);
            percentNumber.setAlignment(HorizontalAlignment.RIGHT);
            setThinBorders(percentNumber);

            intNumber = wb.createCellStyle();
            intNumber.setDataFormat(intFmt);
            intNumber.setAlignment(HorizontalAlignment.RIGHT);
            setThinBorders(intNumber);

            subtotalText = wb.createCellStyle();
            subtotalText.setFont(boldFont);
            subtotalText.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            subtotalText.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(subtotalText);

            subtotalNumber = wb.createCellStyle();
            subtotalNumber.setFont(boldFont);
            subtotalNumber.setDataFormat(decFmt);
            subtotalNumber.setAlignment(HorizontalAlignment.RIGHT);
            subtotalNumber.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            subtotalNumber.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(subtotalNumber);

            totalText = wb.createCellStyle();
            totalText.setFont(boldFont);
            totalText.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            totalText.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(totalText);

            totalNumber = wb.createCellStyle();
            totalNumber.setFont(boldFont);
            totalNumber.setDataFormat(decFmt);
            totalNumber.setAlignment(HorizontalAlignment.RIGHT);
            totalNumber.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            totalNumber.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(totalNumber);
        }

        private void setThinBorders(CellStyle style) {
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
        }
    }
}
