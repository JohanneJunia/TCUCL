package tcucl.back_tcucl.service.impl.onglet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tcucl.back_tcucl.dto.onglet.batimentImmobilisationMobilier.*;
import tcucl.back_tcucl.dto.onglet.batimentImmobilisationMobilier.BatimentImmobilisationMobilierResultatDto;
import tcucl.back_tcucl.entity.Annee;
import tcucl.back_tcucl.entity.Entite;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmission;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmissionParametre;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentExistantOuNeufConstruit;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentImmobilisationMobilierOnglet;
import tcucl.back_tcucl.entity.onglet.batiment.EntretienCourant;
import tcucl.back_tcucl.entity.onglet.batiment.MobilierElectromenager;
import tcucl.back_tcucl.entity.onglet.batiment.enums.EnumBatiment_Mobilier;
import tcucl.back_tcucl.entity.onglet.batiment.enums.EnumBatiment_TypeBatiment;
import tcucl.back_tcucl.manager.BatimentImmobilisationMobilierOngletManager;
import tcucl.back_tcucl.service.BatimentImmobilisationMobilierOngletService;
import tcucl.back_tcucl.service.FacteurEmissionService;

import java.time.temporal.ChronoField;
import java.time.temporal.TemporalAccessor;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class BatimentImmobilisationMobilierOngletServiceImpl implements BatimentImmobilisationMobilierOngletService {

    private static final Logger log = LoggerFactory.getLogger(BatimentImmobilisationMobilierOngletServiceImpl.class);
    private static final int DUREE_AMORTISSEMENT_BATIMENT = 50;

    private final BatimentImmobilisationMobilierOngletManager batimentImmobilisationMobilierOngletManager;

    private final FacteurEmissionService facteurEmissionService;

    public BatimentImmobilisationMobilierOngletServiceImpl(BatimentImmobilisationMobilierOngletManager batimentImmobilisationMobilierOngletManager, FacteurEmissionService facteurEmissionService) {
        this.batimentImmobilisationMobilierOngletManager = batimentImmobilisationMobilierOngletManager;
        this.facteurEmissionService = facteurEmissionService;
    }

    @Override
    public BatimentImmobilisationMobilierOnglet getBatimentImmobilisationMobilierOngletById(Long ongletId) {
        return batimentImmobilisationMobilierOngletManager.getBatimentImmobilisationMobilierOngletById(ongletId);

    }

    @Override
    public void updateBatimentImmobilisationMobilierOnglet(Long ongletId, BatimentImmobilisationMobilierOngletDto batimentImmobilisationMobilierOngletDto) {
        batimentImmobilisationMobilierOngletManager.updateBatimentImmobilisationMobilierOnglet(ongletId, batimentImmobilisationMobilierOngletDto);

    }

    @Transactional
    @Override
    public void ajouterBatiment(Long ongletId, BatimentExistantOuNeufConstruitDto batimentExistantOuNeufConstruitDto) {
        // On récupère l'année actuel
        BatimentImmobilisationMobilierOnglet currentOnglet = batimentImmobilisationMobilierOngletManager.getBatimentImmobilisationMobilierOngletById(ongletId);

        BatimentExistantOuNeufConstruit batimentExistantOuNeufConstruit = new BatimentExistantOuNeufConstruit(batimentExistantOuNeufConstruitDto);

        // On récupère l'année de l'onglet
        Optional.ofNullable(currentOnglet.getAnnee())
                // On récupère l'entité associée à l'année
                .map(Annee::getEntite)
                // On récupère la liste des années de l'entité
                .map(Entite::getAnnees)
                // Si l'entité ou la liste des années est vide, on utilise une liste vide
                .orElse(Collections.emptyList())
                // On crée un flux à partir de la liste des années
                .stream()
                // On filtre pour récupérer les années
                // >= annéeActuelle  &&   <= anneeMaxAjout
                .filter(annee -> annee.getAnneeValeur() >= currentOnglet.getAnnee().getAnneeValeur())
                //Sur chacune des années on récupère l'Onglet de batiment immobilisation mobilier
                .map(Annee::getBatimentImmobilisationMobilierOnglet)
                // On ajoute sur chacun des onglets le batiment à ajouter
                .forEach(batOnglet -> batimentImmobilisationMobilierOngletManager.ajouterBatiment(batOnglet, batimentExistantOuNeufConstruit));

    }

    @Override
    public void supprimerBatiment(Long ongletId, Long batimentId) {
        batimentImmobilisationMobilierOngletManager.supprimerBatimentFromOnglet(ongletId, batimentId);
    }

    @Override
    public void updateBatimentPartiel(Long ongletId, Long batimentId, BatimentExistantOuNeufConstruitDto batimentExistantOuNeufConstruitDto) {
        batimentImmobilisationMobilierOngletManager.updateBatimentPartiel(ongletId, batimentId, batimentExistantOuNeufConstruitDto);

    }

    @Transactional
    @Override
    public void ajouterEntretienCourant(Long ongletId, EntretienCourantDto entretienCourantDto) {
        // On récupère l'année actuel
        BatimentImmobilisationMobilierOnglet currentOnglet = batimentImmobilisationMobilierOngletManager.getBatimentImmobilisationMobilierOngletById(ongletId);

        EntretienCourant entretienCourant = new EntretienCourant(entretienCourantDto);

        // On récupère l'année de l'onglet
        Optional.ofNullable(currentOnglet.getAnnee())
                // On récupère l'entité associée à l'année
                .map(Annee::getEntite)
                // On récupère la liste des années de l'entité
                .map(Entite::getAnnees)
                // Si l'entité ou la liste des années est vide, on utilise une liste vide
                .orElse(Collections.emptyList())
                // On crée un flux à partir de la liste des années
                .stream()
                // On filtre pour récupérer les années
                // >= annéeActuelle  &&   <= anneeMaxAjout
                .filter(annee -> annee.getAnneeValeur() >= currentOnglet.getAnnee().getAnneeValeur())
                //Sur chacune des années on récupère l'Onglet de batiment immobilisation mobilier
                .map(Annee::getBatimentImmobilisationMobilierOnglet)
                // On ajoute sur chacun des onglets le batiment à ajouter
                .forEach(batOnglet -> batimentImmobilisationMobilierOngletManager.ajouterEntretienCourant(batOnglet, entretienCourant));


    }

    @Override
    public void supprimerEntretienCourant(Long ongletId, Long entretienCourantId) {
        batimentImmobilisationMobilierOngletManager.supprimerEntretienCourantFromOnglet(ongletId, entretienCourantId);

    }

    @Override
    public void updateEntretienCourantPartiel(Long ongletId, Long entretienCourantId, EntretienCourantDto entretienCourantDto) {
        batimentImmobilisationMobilierOngletManager.updateEntretienCourantPartiel(ongletId, entretienCourantId, entretienCourantDto);

    }

    @Override
    public void ajouterMobilierElectromenager(Long ongletId, MobilierElectromenagerDto mobilierElectromenagerDto) {
        batimentImmobilisationMobilierOngletManager.ajouterMobilierElectromenager(ongletId, mobilierElectromenagerDto);

    }

    @Override
    public void supprimerMobilierElectromenager(Long ongletId, Long mobilierElectromenagerId) {
        batimentImmobilisationMobilierOngletManager.supprimerMobilierElectromenagerFromOnglet(ongletId, mobilierElectromenagerId);

    }

    @Override
    public void updateMobilierElectromenagerPartiel(Long ongletId, Long mobilierElectromenagerId, MobilierElectromenagerDto mobilierElectromenagerDto) {
        batimentImmobilisationMobilierOngletManager.updateMobilierElectromenagerPartiel(ongletId, mobilierElectromenagerId, mobilierElectromenagerDto);

    }

    // =====================================================================
    // Calcul des émissions (ticket 1) : un élément incomplet contribue pour 0
    // au lieu de faire échouer tout l'onglet et la synthèse EGES.
    // =====================================================================

    @Override
    public BatimentImmobilisationMobilierResultatDto getBatimentImmobilisationMobilierResult(Long ongletId) {
        BatimentImmobilisationMobilierOnglet onglet =
                batimentImmobilisationMobilierOngletManager.getBatimentImmobilisationMobilierOngletById(ongletId);
        int anneeBilan = onglet.getAnnee().getAnneeValeur();

        BatimentImmobilisationMobilierResultatDto resultatDto = new BatimentImmobilisationMobilierResultatDto();

        // Bâtiments : la même valeur alimente la table et le total
        Map<Long, Float> emissionsParBatiment = new LinkedHashMap<>();
        for (BatimentExistantOuNeufConstruit batiment : listeOuVide(onglet.getBatimentExistantOuNeufConstruits())) {
            emissionsParBatiment.put(batiment.getId(), emissionBatiment(batiment, anneeBilan));
        }
        resultatDto.setEmissionGESBatimentExistantOuNeufConstruit(emissionsParBatiment);
        resultatDto.setTotalPosteBatiment(somme(emissionsParBatiment));

        // Entretiens courants
        Map<Long, Float> emissionsParEntretien = new LinkedHashMap<>();
        for (EntretienCourant entretien : listeOuVide(onglet.getEntretienCourants())) {
            emissionsParEntretien.put(entretien.getId(), emissionEntretien(entretien, anneeBilan));
        }
        resultatDto.setEmissionGESEntretienCourant(emissionsParEntretien);
        resultatDto.setTotalPosteEntretien(somme(emissionsParEntretien));

        // Mobilier et électroménager
        Map<Long, Float> emissionsParMobilier = new LinkedHashMap<>();
        for (MobilierElectromenager mobilier : listeOuVide(onglet.getMobilierElectromenagers())) {
            emissionsParMobilier.put(mobilier.getId(), emissionMobilier(mobilier, anneeBilan));
        }
        resultatDto.setEmissionGESMobilierElectromenager(emissionsParMobilier);
        resultatDto.setTotalPosteMobilier(somme(emissionsParMobilier));

        return resultatDto;
    }

    // ---------- Bâtiments ----------

    /** Émissions annuelles d'un bâtiment (tCO2e/an). Ne lève jamais d'exception. */
    private float emissionBatiment(BatimentExistantOuNeufConstruit batiment, int anneeBilan) {
        // ACV réalisée : émissions réelles amorties sur 50 ans
        if (Boolean.TRUE.equals(batiment.getAcvBatimentRealisee())) {
            return enFloat(batiment.getEmissionsGesReellesTCO2()) / DUREE_AMORTISSEMENT_BATIMENT;
        }
        // Hors période d'amortissement : contribution nulle (dates absentes ignorées)
        int seuil = anneeBilan - DUREE_AMORTISSEMENT_BATIMENT;
        if (!estPosterieurA(batiment.getDateConstruction(), seuil)
                && !estPosterieurA(batiment.getDateDerniereGrosseRenovation(), seuil)) {
            return 0f;
        }
        if (batiment.getTypeStructure() == null) {
            return 0f;
        }
        float facteur = valeur(facteurBatiment(batiment.getTypeBatiment(), batiment.getTypeStructure().toString()));
        return facteur * enFloat(batiment.getSurfaceEnM2()) / (DUREE_AMORTISSEMENT_BATIMENT * 1000f);
    }

    private FacteurEmission facteurBatiment(EnumBatiment_TypeBatiment type, String structure) {
        if (type == null) return null;
        try {
            return switch (type) {
                case BUREAUX -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_BUREAUX, structure);
                case ENSEIGNEMENT -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_ENSEIGNEMENT, structure);
                case EQUIPEMENT_SPORTIF -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_EQUIP_SPORTIF, structure);
                case HOPITAL -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_HOPITAL, structure);
                case LOGEMENT_COLLECTIF -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_LOGEMENT_COLLECTIF, structure);
                case RESTAURATION -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_RESTAURATION, structure);
                case AUTRE -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.BATIMENTS_AUTRES, structure);
                default -> null;   // NA ou type non géré
            };
        } catch (RuntimeException e) {
            log.warn("Facteur bâtiment introuvable (type={}, structure={})", type, structure, e);
            return null;
        }
    }

    // ---------- Entretiens courants ----------

    private float emissionEntretien(EntretienCourant entretien, int anneeBilan) {
        float duree = enFloat(entretien.getDureeAmortissement());
        if (duree <= 0
                || entretien.getTypeTravaux() == null
                || !estPosterieurA(entretien.getDateTravaux(), anneeBilan - (int) duree)) {
            return 0f;
        }
        float facteur = valeur(facteurEntretien(entretien.getTypeBatiment(), entretien.getTypeTravaux().toString()));
        return facteur * enFloat(entretien.getSurfaceConcernee()) / (duree * 1000f);
    }

    private FacteurEmission facteurEntretien(EnumBatiment_TypeBatiment type, String travaux) {
        if (type == null) return null;
        try {
            return switch (type) {
                case BUREAUX -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_BUREAUX, travaux);
                case ENSEIGNEMENT -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_ENSEIGNEMENT, travaux);
                case EQUIPEMENT_SPORTIF -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_EQUIP_SPORTIF, travaux);
                case HOPITAL -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_HOPITAL, travaux);
                case LOGEMENT_COLLECTIF -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_LOGEMENT_COLLECTIF, travaux);
                case RESTAURATION -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_RESTAURATION, travaux);
                case AUTRE -> facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.ENTRETIEN_AUTRES, travaux);
                default -> null;
            };
        } catch (RuntimeException e) {
            log.warn("Facteur entretien introuvable (type={}, travaux={})", type, travaux, e);
            return null;
        }
    }

    // ---------- Mobilier et électroménager ----------

    private float emissionMobilier(MobilierElectromenager mobilier, int anneeBilan) {
        float duree = enFloat(mobilier.getDureeAmortissement());
        if (duree <= 0
                || mobilier.getMobilier() == null
                || !estPosterieurA(mobilier.getDateAjout(), anneeBilan - (int) duree)) {
            return 0f;
        }
        float quantite = enFloat(mobilier.getQuantite());
        float poids = enFloat(mobilier.getPoidsDuProduit());
        String libelle = mobilier.getMobilier().getLibelle();
        try {
            if (poids != 0f) {
                float fe = valeur(facteurEmissionService.findByCategorieAndTypeAndUnite(
                        FacteurEmissionParametre.MOBILIER, libelle, FacteurEmissionParametre.MOBILIER_.KG_CO2E_PAR_KG_PRODUIT));
                return (quantite * poids * fe / 1000f) / duree;
            }
            if (mobilier.getMobilier() == EnumBatiment_Mobilier.AUTRE_MOBILIER_EN_EUROS
                    || mobilier.getMobilier() == EnumBatiment_Mobilier.AUTRE_MOBILIER_EN_TONNES) {
                float fe = valeur(facteurEmissionService.findByCategorieAndType(FacteurEmissionParametre.MOBILIER, libelle));
                return (fe * quantite / 1000f) / duree;
            }
            float fe = valeur(facteurEmissionService.findByCategorieAndTypeAndUnite(
                    FacteurEmissionParametre.MOBILIER, libelle, FacteurEmissionParametre.MOBILIER_.KG_CO2E_PAR_PRODUIT));
            return (fe * quantite / 1000f) / duree;
        } catch (RuntimeException e) {
            log.warn("Facteur mobilier introuvable ({})", libelle, e);
            return 0f;
        }
    }

    // ---------- Utilitaires ----------

    private static float enFloat(Number n) {
        return n == null ? 0f : n.floatValue();
    }

    private static float valeur(FacteurEmission fe) {
        return fe == null ? 0f : enFloat(fe.getFacteurEmission());
    }

    private static boolean estPosterieurA(TemporalAccessor date, int annee) {
        return date != null && date.get(ChronoField.YEAR) > annee;
    }

    private static <T> List<T> listeOuVide(List<T> liste) {
        return liste == null ? List.of() : liste;
    }

    private static float somme(Map<Long, Float> valeurs) {
        float total = 0f;
        for (Float v : valeurs.values()) {
            if (v != null && Float.isFinite(v)) total += v;
        }
        return total;
    }
}