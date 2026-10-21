package tcucl.back_tcucl.service.impl.onglet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tcucl.back_tcucl.dto.onglet.batimentImmobilisationMobilier.BatimentImmobilisationMobilierResultatDto;
import tcucl.back_tcucl.entity.Annee;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmission;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmissionParametre;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentExistantOuNeufConstruit;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentImmobilisationMobilierOnglet;
import tcucl.back_tcucl.entity.onglet.batiment.enums.EnumBatiment_TypeBatiment;
import tcucl.back_tcucl.entity.onglet.batiment.enums.EnumBatiment_TypeStructure;
import tcucl.back_tcucl.manager.BatimentImmobilisationMobilierOngletManager;
import tcucl.back_tcucl.service.FacteurEmissionService;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Ticket 1 : un bâtiment mal renseigné ne doit plus faire disparaître
 * le CO2 de l'onglet Bâtiments (ni de la synthèse EGES).
 */
class BatimentImmobilisationMobilierOngletServiceImplTest {

    private static final long ONGLET_ID = 1L;
    private static final int ANNEE = 2025;
    private static final float DELTA = 1e-4f;

    private FacteurEmissionService facteurService;
    private BatimentImmobilisationMobilierOngletServiceImpl service;
    private BatimentImmobilisationMobilierOnglet onglet;

    @BeforeEach
    void setUp() {
        BatimentImmobilisationMobilierOngletManager manager = mock(BatimentImmobilisationMobilierOngletManager.class);
        facteurService = mock(FacteurEmissionService.class);
        service = new BatimentImmobilisationMobilierOngletServiceImpl(manager, facteurService);

        Annee annee = mock(Annee.class);
        when(annee.getAnneeValeur()).thenReturn(ANNEE);

        onglet = mock(BatimentImmobilisationMobilierOnglet.class);
        when(onglet.getAnnee()).thenReturn(annee);
        when(onglet.getEntretienCourants()).thenReturn(List.of());
        when(onglet.getMobilierElectromenagers()).thenReturn(List.of());
        when(manager.getBatimentImmobilisationMobilierOngletById(ONGLET_ID)).thenReturn(onglet);
    }

    /** Bâtiment valide par défaut : bureaux, construit en 2010, 1000 m², sans ACV. */
    private BatimentExistantOuNeufConstruit batiment(long id) {
        BatimentExistantOuNeufConstruit b = mock(BatimentExistantOuNeufConstruit.class);
        when(b.getId()).thenReturn(id);
        when(b.getAcvBatimentRealisee()).thenReturn(false);
        when(b.getTypeBatiment()).thenReturn(EnumBatiment_TypeBatiment.BUREAUX);
        when(b.getTypeStructure()).thenReturn(EnumBatiment_TypeStructure.values()[0]);
        when(b.getSurfaceEnM2()).thenReturn(1000f);
        when(b.getDateConstruction()).thenReturn(LocalDate.of(2010, 1, 1));
        return b;
    }

    private void facteurBureaux(float valeur) {
        FacteurEmission fe = mock(FacteurEmission.class);
        when(fe.getFacteurEmission()).thenReturn(valeur);
        when(facteurService.findByCategorieAndType(eq(FacteurEmissionParametre.BATIMENTS_BUREAUX), anyString()))
                .thenReturn(fe);
    }

    private BatimentImmobilisationMobilierResultatDto calculer(BatimentExistantOuNeufConstruit... batiments) {
        when(onglet.getBatimentExistantOuNeufConstruits()).thenReturn(List.of(batiments));
        return service.getBatimentImmobilisationMobilierResult(ONGLET_ID);
    }

    @Test
    void batimentRecent_calculeAvecLeFacteur() {
        facteurBureaux(100f);   // 100 kgCO2e/m² × 1000 m² / (50 ans × 1000) = 2 t/an
        var res = calculer(batiment(1));
        assertEquals(2f, res.getEmissionGESBatimentExistantOuNeufConstruit().get(1L), DELTA);
        assertEquals(2f, res.getTotalPosteBatiment(), DELTA);
    }

    @Test
    void batimentAncienSansRenovation_contribueZeroSansErreur() {
        var b = batiment(1);
        when(b.getDateConstruction()).thenReturn(LocalDate.of(1960, 1, 1));
        // date de rénovation non renseignée (null par défaut)
        var res = assertDoesNotThrow(() -> calculer(b));
        assertEquals(0f, res.getTotalPosteBatiment(), DELTA);
    }

    @Test
    void typeNA_contribueZeroSansErreur() {
        var b = batiment(1);
        when(b.getTypeBatiment()).thenReturn(EnumBatiment_TypeBatiment.NA);
        var res = assertDoesNotThrow(() -> calculer(b));
        assertEquals(0f, res.getTotalPosteBatiment(), DELTA);
    }

    @Test
    void structureAbsente_contribueZeroSansErreur() {
        var b = batiment(1);
        when(b.getTypeStructure()).thenReturn(null);
        var res = assertDoesNotThrow(() -> calculer(b));
        assertEquals(0f, res.getTotalPosteBatiment(), DELTA);
    }

    @Test
    void acvRealisee_memeValeurDansLaTableEtLeTotal() {
        var b = batiment(1);
        when(b.getAcvBatimentRealisee()).thenReturn(true);
        when(b.getEmissionsGesReellesTCO2()).thenReturn(500f);
        var res = calculer(b);
        assertEquals(10f, res.getEmissionGESBatimentExistantOuNeufConstruit().get(1L), DELTA);
        assertEquals(10f, res.getTotalPosteBatiment(), DELTA);
    }

    @Test
    void acvSansEmissionsSaisies_contribueZeroSansErreur() {
        var b = batiment(1);
        when(b.getAcvBatimentRealisee()).thenReturn(true);
        when(b.getEmissionsGesReellesTCO2()).thenReturn(null);
        var res = assertDoesNotThrow(() -> calculer(b));
        assertEquals(0f, res.getTotalPosteBatiment(), DELTA);
    }

    @Test
    void unBatimentInvalide_nEmpechePasLeCalculDesAutres() {
        facteurBureaux(100f);
        var invalide = batiment(1);
        when(invalide.getTypeBatiment()).thenReturn(EnumBatiment_TypeBatiment.NA);
        var valide = batiment(2);

        var res = assertDoesNotThrow(() -> calculer(invalide, valide));
        assertEquals(0f, res.getEmissionGESBatimentExistantOuNeufConstruit().get(1L), DELTA);
        assertEquals(2f, res.getEmissionGESBatimentExistantOuNeufConstruit().get(2L), DELTA);
        assertEquals(2f, res.getTotalPosteBatiment(), DELTA);
    }
}