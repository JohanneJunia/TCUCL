package tcucl.back_tcucl.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tcucl.back_tcucl.entity.Entite;
import tcucl.back_tcucl.service.EntiteService;
import tcucl.back_tcucl.service.SyntheseEGESService;
import tcucl.back_tcucl.service.SyntheseEgesExcelExportService;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;

import static tcucl.back_tcucl.controller.ControllerConstante.*;

@RestController
@RequestMapping(REST_API + REST_SYNTHESE_EGES)
public class SyntheseEGESController {
    private static final MediaType XLSX_MEDIA_TYPE = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final SyntheseEGESService syntheseEGESService;
    private final SyntheseEgesExcelExportService syntheseEgesExcelExportService;
    private final EntiteService entiteService;

    public SyntheseEGESController(
            SyntheseEGESService syntheseEGESService,
            SyntheseEgesExcelExportService syntheseEgesExcelExportService,
            EntiteService entiteService) {
        this.syntheseEGESService = syntheseEGESService;
        this.syntheseEgesExcelExportService = syntheseEgesExcelExportService;
        this.entiteService = entiteService;
    }

    @GetMapping(REST_ENTITE_ID)
    @PreAuthorize("hasRole('ROLE_SUPERADMIN') or hasRole('ROLE_ENTITE_' + #entiteId)")
    public ResponseEntity<?> getSyntheseEGESResultat(@PathVariable(value = "entiteId") Long entiteId, @RequestParam(name = "annee") Integer annee) {
        return ResponseEntity.ok(syntheseEGESService.getSyntheseEGESResultat(entiteId, annee));
    }

    @GetMapping(REST_ENTITE_ID + "/export-excel")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN') or hasRole('ROLE_ENTITE_' + #entiteId)")
    public ResponseEntity<byte[]> exportSyntheseExcel(
            @PathVariable(value = "entiteId") Long entiteId,
            @RequestParam(name = "annee") Integer annee) {
        byte[] excelBytes = syntheseEgesExcelExportService.exportSyntheseExcel(entiteId, annee);
        Entite entite = entiteService.getEntiteById(entiteId);
        String slug = slugify(entite != null ? entite.getNom() : ("entite-" + entiteId));
        String anneeLabel = (annee != null) ? ((annee - 1) + "-" + annee) : "annee";
        String filename = "bilan-carbone_" + slug + "_" + anneeLabel + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(XLSX_MEDIA_TYPE);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build());
        return ResponseEntity.ok().headers(headers).body(excelBytes);
    }

    private String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "etablissement";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return normalized.isBlank() ? "etablissement" : normalized;
    }
}
