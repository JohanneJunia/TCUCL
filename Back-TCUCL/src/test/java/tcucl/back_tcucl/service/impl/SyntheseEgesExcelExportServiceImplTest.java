package tcucl.back_tcucl.service.impl;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tcucl.back_tcucl.dto.SyntheseEGESResultatDto;
import tcucl.back_tcucl.entity.Entite;
import tcucl.back_tcucl.service.EntiteService;
import tcucl.back_tcucl.service.SyntheseEGESService;

import java.io.ByteArrayInputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SyntheseEgesExcelExportServiceImplTest {

    @Mock
    private SyntheseEGESService syntheseEGESService;

    @Mock
    private EntiteService entiteService;

    @InjectMocks
    private SyntheseEgesExcelExportServiceImpl exportService;

    @Test
    void exportSyntheseExcel_generatesTwoSheetsWithExpectedValues() throws Exception {
        Entite entite = new Entite("Faculté de Droit", "EDUC_SUP");
        entite.setId(4L);

        SyntheseEGESResultatDto dto = new SyntheseEGESResultatDto();
        dto.setEmissionFugitivesGlobal(10.5f);
        dto.setEnergieGlobal(100.0f);
        dto.setMobiliteDomicileTravailGlobal(50.0f);
        dto.setAutreMobiliteFrGlobal(15.0f);
        dto.setMobiliteInternationalGlobal(40.0f);
        dto.setBatimentParkingGlobal(80.0f);
        dto.setNumeriqueGlobal(20.0f);
        dto.setAutreImmobilisationGlobal(5.0f);
        dto.setAchatGlobal(60.0f);
        dto.setDechetGlobal(12.0f);
        dto.setBilanCarboneTotalGlobal(392.5f);
        dto.setBilanCarboneTotalParUsager(785.0f);
        dto.setEmissionEvitee(3.5f);
        dto.setEffectifTotal(500);
        dto.setSurfaceTotaleBatiments(10000.0f);
        dto.setBilanCarboneTotalParM2(39.25f);
        dto.setConsoEnergieFinaleParM2(120.0f);
        dto.setConsoEnergiePrimaireParM2(180.0f);
        dto.setIntensiteCarboneParM2(10.0f);

        dto.setEmissionDirecteCombustion(70.0f);
        dto.setEmissionDirecteFugitives(10.5f);
        dto.setEmissionIndirecteConsoElec(30.0f);
        dto.setBilanCarboneTotalScope(392.5f);

        when(entiteService.getEntiteById(4L)).thenReturn(entite);
        when(syntheseEGESService.getSyntheseEGESResultat(4L, 2026)).thenReturn(dto);

        byte[] bytes = exportService.exportSyntheseExcel(4L, 2026);
        assertNotNull(bytes);
        assertTrue(bytes.length > 0);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, wb.getNumberOfSheets());
            Sheet syntheseSheet = wb.getSheet("Synthèse par poste");
            Sheet begesSheet = wb.getSheet("Bilan BEGES (Scopes)");
            assertNotNull(syntheseSheet);
            assertNotNull(begesSheet);

            assertEquals("Faculté de Droit (EDUC_SUP)", syntheseSheet.getRow(1).getCell(1).getStringCellValue());
            assertEquals("2025-2026", syntheseSheet.getRow(2).getCell(1).getStringCellValue());

            // Total row is at row 16 (5 metadata + 1 header + 10 sectors = row 16)
            assertEquals("Bilan carbone total", syntheseSheet.getRow(16).getCell(0).getStringCellValue());
            assertEquals(392.5, syntheseSheet.getRow(16).getCell(1).getNumericCellValue(), 0.01);

            // BEGES sheet total row: 5 metadata + 1 header + (5+1 Scope1) + (2+1 Scope2) + (16+1 Scope3) = row 32
            assertEquals("TOTAL BEGES", begesSheet.getRow(32).getCell(0).getStringCellValue());
            assertEquals(392.5, begesSheet.getRow(32).getCell(2).getNumericCellValue(), 0.01);
        }
    }

    @Test
    void exportSyntheseExcel_handlesEmptyOrNullDtoSafely() throws Exception {
        when(entiteService.getEntiteById(99L)).thenReturn(null);
        when(syntheseEGESService.getSyntheseEGESResultat(99L, 2025)).thenReturn(new SyntheseEGESResultatDto());

        byte[] bytes = exportService.exportSyntheseExcel(99L, 2025);
        assertNotNull(bytes);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet syntheseSheet = wb.getSheet("Synthèse par poste");
            assertEquals("Entité #99", syntheseSheet.getRow(1).getCell(1).getStringCellValue());
            assertEquals(0.0, syntheseSheet.getRow(16).getCell(1).getNumericCellValue(), 0.001);
            assertEquals("—", syntheseSheet.getRow(16).getCell(2).getStringCellValue());
        }
    }
}
