package tcucl.back_tcucl.service.impl;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmission;
import tcucl.back_tcucl.exceptionPersonnalisee.NonTrouveGeneralCustomException;
import tcucl.back_tcucl.manager.FacteurEmissionManager;
import tcucl.back_tcucl.service.FacteurEmissionService;
import net.objecthunter.exp4j.Expression;
import net.objecthunter.exp4j.ExpressionBuilder;
import org.apache.poi.ss.util.CellReference;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FacteurEmissionServiceImpl implements FacteurEmissionService {

    private static final Logger log = LoggerFactory.getLogger(FacteurEmissionServiceImpl.class);

    private final FacteurEmissionManager facteurEmissionManager;

    public FacteurEmissionServiceImpl(FacteurEmissionManager facteurEmissionManager) {
        this.facteurEmissionManager = facteurEmissionManager;
    }

    @Override
    public void importFacteurEmissionFromExcel(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            facteurEmissionManager.deleteAll();

            for (int i = 3; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String categorie = getCellValue(row.getCell(0));
                    String type = getCellValue(row.getCell(1));
                    Float facteur = parseFloatSafe(row.getCell(2), sheet);
                    String unite = getCellValue(row.getCell(3));
                    // Si tu as une colonne pourcentage en cellule 4 :
                    // Double pourcentage = parsePourcentage(row.getCell(4));

                    if (categorie == null || type == null) {
                        System.out.printf("Ligne %d ignorée : données manquantes.%n", i + 1);
                        continue;
                    }

                    FacteurEmission fe = new FacteurEmission();
                    fe.setCategorie(categorie.strip());
                    fe.setType(type.strip());
                    fe.setFacteurEmission(facteur);
                    fe.setUnite(unite != null ? unite.strip() : "");
                    // fe.setPourcentage(pourcentage); // si applicable

                    facteurEmissionManager.save(fe);

                } catch (Exception e) {
                    System.err.printf("Erreur à la ligne %d : %s%n", i + 1, e.getMessage());
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Override
    public FacteurEmission findByCategorieAndTypeAndUnite(String categorie, String type, String unite){
        String cleanCat = categorie != null ? categorie.strip() : null;
        String cleanType = type != null ? type.strip() : null;
        String cleanUnite = unite != null ? unite.strip() : null;
        try {
            return facteurEmissionManager.findByCategorieAndTypeAndUnite(cleanCat, cleanType, cleanUnite);
        } catch (NonTrouveGeneralCustomException e) {
            log.warn("Facteur d'émission introuvable pour categorie={} type={} unite={}, fallback à 0", cleanCat, cleanType, cleanUnite);
            FacteurEmission facteurEmission = new FacteurEmission();
            facteurEmission.setCategorie(cleanCat);
            facteurEmission.setType(cleanType);
            facteurEmission.setUnite(cleanUnite);
            facteurEmission.setFacteurEmission(0f);
            return facteurEmission;
        }
    }

    @Override
    public FacteurEmission findByCategorieAndType(String categorie, String type) {
        String cleanCat = categorie != null ? categorie.strip() : null;
        String cleanType = type != null ? type.strip() : null;
        try {
            return facteurEmissionManager.findByCategorieAndType(cleanCat, cleanType);
        } catch (NonTrouveGeneralCustomException e) {
            log.warn("Facteur d'émission introuvable pour categorie={} type={}, fallback à 0", cleanCat, cleanType);
            FacteurEmission facteurEmission = new FacteurEmission();
            facteurEmission.setCategorie(cleanCat);
            facteurEmission.setType(cleanType);
            facteurEmission.setFacteurEmission(0f);
            return facteurEmission;
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            case BLANK -> null;
            default -> null;
        };
    }

    private Float parseFloatSafe(Cell cell, Sheet sheet) {
        try {
            if (cell == null) return 0.0f;

            if (cell.getCellType() == CellType.NUMERIC) {
                return (float) cell.getNumericCellValue();
            }

            String formula = getCellValue(cell);
            if (formula == null || formula.isBlank()) return 0.0f;

            formula = formula.replace(",", ".");

            // Recherche toutes les références de cellules (ex: C4, B12...)
            Pattern cellRefPattern = Pattern.compile("\\b([A-Z]+[0-9]+)\\b");
            Matcher matcher = cellRefPattern.matcher(formula);
            while (matcher.find()) {
                String ref = matcher.group(1);
                CellReference cellRef = new CellReference(ref);
                Row refRow = sheet.getRow(cellRef.getRow());
                if (refRow != null) {
                    Cell refCell = refRow.getCell(cellRef.getCol());
                    float value = parseFloatSafe(refCell, sheet);
                    formula = formula.replace(ref, String.valueOf(value));
                } else {
                    formula = formula.replace(ref, "0");
                }
            }

            // Évalue l'expression mathématique
            Expression exp = new ExpressionBuilder(formula).build();
            return (float) exp.evaluate();

        } catch (Exception e) {
            System.err.println("Erreur de conversion/évaluation : " + e.getMessage());
            return 0.0f;
        }
    }



}
