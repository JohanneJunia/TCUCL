package tcucl.back_tcucl.service.impl.onglet;

import org.springframework.stereotype.Service;
import tcucl.back_tcucl.dto.onglet.numerique.EquipementNumeriqueDto;
import tcucl.back_tcucl.dto.onglet.numerique.NumeriqueOngletDto;
import tcucl.back_tcucl.dto.onglet.numerique.NumeriqueResultatDto;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmissionParametre;
import tcucl.back_tcucl.entity.onglet.numerique.NumeriqueOnglet;
import tcucl.back_tcucl.entity.onglet.numerique.EquipementNumerique;
import tcucl.back_tcucl.manager.NumeriqueOngletManager;
import tcucl.back_tcucl.service.FacteurEmissionService;
import tcucl.back_tcucl.service.NumeriqueOngletService;

import java.util.concurrent.atomic.AtomicReference;

@Service
public class NumeriqueOngletServiceImpl implements NumeriqueOngletService {

    private final NumeriqueOngletManager numeriqueOngletManager;
    private final FacteurEmissionService facteurEmissionService;

    public NumeriqueOngletServiceImpl(NumeriqueOngletManager numeriqueOngletManager, FacteurEmissionService facteurEmissionService) {
        this.numeriqueOngletManager = numeriqueOngletManager;
        this.facteurEmissionService = facteurEmissionService;
    }

    @Override
    public NumeriqueOnglet getNumeriqueOngletById(Long ongletId) {
        return numeriqueOngletManager.getNumeriqueOngletById(ongletId);
    }

    @Override
    public EquipementNumerique getEquipementNumeriqueById(Long ongletId, Long equipementId) {
        return numeriqueOngletManager.getEquipementNumeriqueById(ongletId, equipementId);
    }

    @Override
    public void updateNumeriqueOngletPartiel(Long ongletId, NumeriqueOngletDto numeriqueOngletDto) {
        numeriqueOngletManager.updateNumeriqueOngletPartiel(ongletId, numeriqueOngletDto);
    }

    @Override
    public void ajouterEquipementNumerique(Long ongletId, EquipementNumeriqueDto equipementNumeriqueDto) {
        numeriqueOngletManager.ajouterEquipementNumerique(ongletId, equipementNumeriqueDto);
    }

    @Override
    public void supprimerEquipementNumerique(Long ongletId, Long equipementId) {
        numeriqueOngletManager.supprimerEquipementNumerique(ongletId, equipementId);
    }

    @Override
    public void updateEquipementNumeriquePartiel(Long ongletId, Long equipementId, EquipementNumeriqueDto equipementNumeriqueDto) {
        numeriqueOngletManager.updateEquipementNumeriquePartiel(ongletId, equipementId, equipementNumeriqueDto);
    }

    @Override
    public NumeriqueResultatDto getNumeriqueResultat(Long ongletId) {
        NumeriqueOnglet onglet = numeriqueOngletManager.getNumeriqueOngletById(ongletId);
        NumeriqueResultatDto resultat = new NumeriqueResultatDto();

        AtomicReference<Float> sumEgesEquipementsNumeriques = new AtomicReference<>(0f);

        if (onglet.getEquipementNumeriqueList() != null) {
            onglet.getEquipementNumeriqueList().forEach(equipement -> {
                float egesEquipement = 0f;
                if (equipement.getNombre() > 0) {
                    Float facteurEmission = 0f;
                    if (Boolean.TRUE.equals(equipement.getEmissionsGesPrecisesConnues())) {
                        facteurEmission = equipement.getEmissionsReellesParProduitKgCO2e() != null
                                ? equipement.getEmissionsReellesParProduitKgCO2e() : 0f;
                    } else if (equipement.getEquipement() != null) {
                        try {
                            facteurEmission = facteurEmissionService.findByCategorieAndType(
                                    FacteurEmissionParametre.NUMERIQUE,
                                    equipement.getEquipement().getLibelle()
                            ).getFacteurEmission();
                        } catch (Exception e) {
                            facteurEmission = 0f;
                        }
                    }

                    if (facteurEmission == null) {
                        facteurEmission = 0f;
                    }

                    if (equipement.getDureeAmortissement() > 0) {
                        egesEquipement = facteurEmission * equipement.getNombre() / (equipement.getDureeAmortissement() * 1000f);
                    }
                }

                Float finalEgesEquipement = egesEquipement;
                sumEgesEquipementsNumeriques.updateAndGet(v -> v + finalEgesEquipement);
                resultat.addResultatEquipementNumerique(
                        equipement.getId(),
                        egesEquipement
                );
            });
        }

        float totalEquipements = sumEgesEquipementsNumeriques.get();
        resultat.setEmpreinteCarboneEquipements(totalEquipements);

        // Méthode simplifiée ADEME : Equipements = 81%, Datacenters + Réseaux = 19%
        float methodeSimplifiee = (totalEquipements / 0.81f) * 0.19f;
        resultat.setMethodeSimplifieeResultat(methodeSimplifiee);

        float traficCloud = (onglet.getTraficCloudUtilisateur() != null) ? onglet.getTraficCloudUtilisateur() : 0f;
        float traficTip = (onglet.getTraficTipUtilisateur() != null) ? onglet.getTraficTipUtilisateur() : 0f;
        float partTraficFranceEtranger = (onglet.getPartTraficFranceEtranger() != null) ? onglet.getPartTraficFranceEtranger() : 0.55f;

        float trafficCloudReel = traficCloud + (traficTip / 0.15f);
        Float empreinteCarboneDataCenter = (trafficCloudReel * partTraficFranceEtranger * 0.007f * 493f +
                trafficCloudReel * (1f - partTraficFranceEtranger)
                        * 0.069f * 57.1f) / 1000000f;
        resultat.setEmpreinteCarboneDataCenter(empreinteCarboneDataCenter);

        if (trafficCloudReel == 0f) {
            // Pas de données cloud : on applique la méthode simplifiée forfaitaire pour datacenter + réseaux
            resultat.setEmpreinteCarboneDataCenterEtReseaux(methodeSimplifiee);
            resultat.setTotalNumerique(totalEquipements + methodeSimplifiee);
        } else {
            // Données cloud renseignées
            Float reseau = (totalEquipements / 0.81f) * 0.05f;
            Float phaseAmont = (1f - partTraficFranceEtranger) * trafficCloudReel * 0.0669f * 2.58f * 0.15f * 213.8f / 1000000f;
            Float dataCenterEtReseaux = empreinteCarboneDataCenter + phaseAmont + reseau;
            resultat.setEmpreinteCarboneDataCenterEtReseaux(dataCenterEtReseaux);
            resultat.setTotalNumerique(totalEquipements + dataCenterEtReseaux);
        }

        return resultat;
    }
}
