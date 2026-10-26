package tcucl.back_tcucl.service.impl;

import org.springframework.stereotype.Service;
import tcucl.back_tcucl.dto.ListIdDto;
import tcucl.back_tcucl.dto.SyntheseEGESResultatDto;
import tcucl.back_tcucl.entity.onglet.GeneralOnglet;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentExistantOuNeufConstruit;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteBois;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteFioul;
import tcucl.back_tcucl.service.*;
import jakarta.persistence.EntityNotFoundException;
import java.util.Objects;

@Service
public class SyntheseEGESServiceImpl implements SyntheseEGESService {

    private final AnneeService anneeService;
    private final GeneralOngletService generalOngletService;
    private final EnergieOngletService energieOngletService;
    private final AchatOngletService achatOngletService;
    private final AutreImmobilisationOngletService autreImmobilisationOngletService;
    private final AutreMobFrOngletService autreMobFrOngletService;
    private final BatimentImmobilisationMobilierOngletService batimentImmobilisationMobilierOngletService;
    private final DechetOngletService dechetOngletService;
    private final EmissionFugitiveOngletService emissionFugitiveOngletService;
    private final MobiliteDomicileTravailOngletService mobiliteDomicileTravailOngletService;
    private final MobInternationalOngletService mobInternationalOngletService;
    private final NumeriqueOngletService numeriqueOngletService;
    private final ParkingVoirieOngletService parkingVoirieOngletService;
    private final VehiculeOngletService vehiculeOngletService;

    public SyntheseEGESServiceImpl(AnneeService anneeService,
                                   GeneralOngletService generalOngletService,
                                   EnergieOngletService energieOngletService,
                                   AchatOngletService achatOngletService,
                                   AutreImmobilisationOngletService autreImmobilisationOngletService,
                                   AutreMobFrOngletService autreMobFrOngletService,
                                   BatimentImmobilisationMobilierOngletService batimentImmobilisationMobilierOngletService,
                                   DechetOngletService dechetOngletService,
                                   EmissionFugitiveOngletService emissionFugitiveOngletService,
                                   MobiliteDomicileTravailOngletService mobiliteDomicileTravailOngletService,
                                   MobInternationalOngletService mobInternationalOngletService,
                                   NumeriqueOngletService numeriqueOngletService,
                                   ParkingVoirieOngletService parkingVoirieOngletService,
                                   VehiculeOngletService vehiculeOngletService) {
        this.anneeService = anneeService;
        this.generalOngletService = generalOngletService;
        this.energieOngletService = energieOngletService;
        this.achatOngletService = achatOngletService;
        this.autreImmobilisationOngletService = autreImmobilisationOngletService;
        this.autreMobFrOngletService = autreMobFrOngletService;
        this.batimentImmobilisationMobilierOngletService = batimentImmobilisationMobilierOngletService;
        this.dechetOngletService = dechetOngletService;
        this.emissionFugitiveOngletService = emissionFugitiveOngletService;
        this.mobiliteDomicileTravailOngletService = mobiliteDomicileTravailOngletService;
        this.mobInternationalOngletService = mobInternationalOngletService;
        this.numeriqueOngletService = numeriqueOngletService;
        this.parkingVoirieOngletService = parkingVoirieOngletService;
        this.vehiculeOngletService = vehiculeOngletService;
    }

    @Override
    public SyntheseEGESResultatDto getSyntheseEGESResultat(Long entiteId, Integer annee) {
        ListIdDto onglets = null;
        try {
            onglets = anneeService.getongletIdListForEntiteAndAnnee(entiteId, annee);
        } catch (EntityNotFoundException e) {
            return new SyntheseEGESResultatDto();
        }

        SyntheseEGESResultatDto syntheseEGESResultatDto = new SyntheseEGESResultatDto();

        // 1. Gestion des usagers
        int nbEtudiant = 0;
        int nbSalarie = 0;
        Long generalOngletId = onglets != null ? onglets.getGeneralOnglet() : null;
        if (generalOngletId != null) {
            GeneralOnglet generalData = generalOngletService.getGeneralOngletById(generalOngletId);
            if (generalData != null) {
                if (generalData.getNbEtudiant() != null) nbEtudiant = generalData.getNbEtudiant();
                if (generalData.getNbSalarie() != null) nbSalarie = generalData.getNbSalarie();
            }
        }
        int totalUsagers = nbEtudiant + nbSalarie;
        syntheseEGESResultatDto.setEffectifTotal(totalUsagers);

        // 2. Émissions fugitives
        Long emissionFugitiveOngletId = onglets != null ? onglets.getEmissionFugitiveOnglet() : null;
        Float emissionFugitivesGlobal = 0.0f;
        if (emissionFugitiveOngletId != null) {
            var res = emissionFugitiveOngletService.getEmissionFugitiveResult(emissionFugitiveOngletId);
            if (res != null) {
                emissionFugitivesGlobal = safeFloat(res.getTotalEmissionGES());
            }
        }
        syntheseEGESResultatDto.setEmissionFugitivesGlobal(emissionFugitivesGlobal);
        syntheseEGESResultatDto.setEmissionFugitivesParUsager(calculerParUsager(emissionFugitivesGlobal, totalUsagers));

        // 3. Énergie
        Long energieOngletId = onglets != null ? onglets.getEnergieOnglet() : null;
        Float energieGlobal = 0.0f;
        Float surfaceTotaleBatiments = 0.0f;
        Float consoEnergieFinaleParM2 = 0.0f;
        Float consoEnergiePrimaireParM2 = 0.0f;
        Float intensiteCarboneParM2 = 0.0f;
        if (energieOngletId != null) {
            var res = energieOngletService.getEnergieResultat(energieOngletId);
            if (res != null) {
                energieGlobal = safeFloat(res.getTotalPosteFluides());
                surfaceTotaleBatiments = safeFloat(res.getSurfaceTotaleBatiments());
                consoEnergieFinaleParM2 = safeFloat(res.getConsoEnergieFinaleParM2());
                consoEnergiePrimaireParM2 = safeFloat(res.getConsoEnergiePrimaireParM2());
                intensiteCarboneParM2 = safeFloat(res.getIntensiteCarboneParM2());
            }
        }
        syntheseEGESResultatDto.setEnergieGlobal(energieGlobal);
        syntheseEGESResultatDto.setEnergieParUsager(calculerParUsager(energieGlobal, totalUsagers));

        // 4. Mobilité domicile-travail
        Long mobiliteDomicileTravailOngletId = onglets != null ? onglets.getMobiliteDomicileTravailOnglet() : null;
        Float mobiliteDomicileTravailGlobal = 0.0f;
        if (mobiliteDomicileTravailOngletId != null) {
            var res = mobiliteDomicileTravailOngletService.getMobiliteDomicileTravailResultat(mobiliteDomicileTravailOngletId);
            if (res != null) {
                mobiliteDomicileTravailGlobal = safeFloat(res.getTotalPosteMobiliteFrance());
            }
        }
        syntheseEGESResultatDto.setMobiliteDomicileTravailGlobal(mobiliteDomicileTravailGlobal);
        syntheseEGESResultatDto.setMobiliteDomicileTravailParUsager(calculerParUsager(mobiliteDomicileTravailGlobal, totalUsagers));

        // 5. Autre mobilité France (inclut Véhicules)
        Long autreMobFrOngletId = onglets != null ? onglets.getAutreMobFrOnglet() : null;
        Long vehiculeOngletId = onglets != null ? onglets.getVehiculeOnglet() : null;
        Float autreMobFrTotal = 0.0f;
        if (autreMobFrOngletId != null) {
            var res = autreMobFrOngletService.getAutreMobFrResultat(autreMobFrOngletId);
            if (res != null) autreMobFrTotal = safeFloat(res.getTotalPosteMobiliteFrance());
        }

        Float vehiculeTotal = 0.0f;
        Float totalEmissionGESPetrole = 0.0f;
        Float totalEmissionGESElectrique = 0.0f;
        Float totalEmissionGESFabrication = 0.0f;
        if (vehiculeOngletId != null) {
            var res = vehiculeOngletService.getVehiculeResult(vehiculeOngletId);
            if (res != null) {
                vehiculeTotal = safeFloat(res.getTotalEmissionGES());
                totalEmissionGESPetrole = safeFloat(res.getTotalEmissionGESPetrole());
                totalEmissionGESElectrique = safeFloat(res.getTotalEmissionGESElectrique());
                totalEmissionGESFabrication = safeFloat(res.getTotalEmissionGESFabrication());
            }
        }

        Float autreMobiliteFrGlobal = autreMobFrTotal + vehiculeTotal;
        syntheseEGESResultatDto.setAutreMobiliteFrGlobal(autreMobiliteFrGlobal);
        syntheseEGESResultatDto.setAutreMobiliteFrParUsager(calculerParUsager(autreMobiliteFrGlobal, totalUsagers));

        // 6. Mobilité internationale
        Long mobInternationalOngletId = onglets != null ? onglets.getMobInternationalOnglet() : null;
        Float mobiliteInternationalGlobal = 0.0f;
        if (mobInternationalOngletId != null) {
            var res = mobInternationalOngletService.getMobInternationalResultat(mobInternationalOngletId);
            if (res != null) {
                Float proEu = safeFloat(res.getEmissionGesProEurope());
                Float stageEu = safeFloat(res.getEmissionGesStageEurope());
                Float semEu = safeFloat(res.getEmissionGesSemestresEtudiantsEurope());
                Float proHorsEu = safeFloat(res.getEmissionGesProHorsEurope());
                Float stageHorsEu = safeFloat(res.getEmissionGesStagesHorsEurope());
                Float semHorsEu = safeFloat(res.getEmissionGesSemestresEtudiantsHorsEurope());
                mobiliteInternationalGlobal = proEu + stageEu + semEu + proHorsEu + stageHorsEu + semHorsEu;
            }
        }
        syntheseEGESResultatDto.setMobiliteInternationalGlobal(mobiliteInternationalGlobal);
        syntheseEGESResultatDto.setMobiliteInternationalParUsager(calculerParUsager(mobiliteInternationalGlobal, totalUsagers));

        // 7. Bâtiment, mobilier & parking
        Long batimentImmobilisationMobilierOngletId = onglets != null ? onglets.getBatimentImmobilisationMobilierOnglet() : null;
        Long parkingVoirieOngletId = onglets != null ? onglets.getParkingVoirieOnglet() : null;

        Float totalPosteBatiment = 0.0f;
        Float totalPosteEntretien = 0.0f;
        Float totalPosteMobilier = 0.0f;
        if (batimentImmobilisationMobilierOngletId != null) {
            var res = batimentImmobilisationMobilierOngletService.getBatimentImmobilisationMobilierResult(batimentImmobilisationMobilierOngletId);
            if (res != null) {
                totalPosteBatiment = safeFloat(res.getTotalPosteBatiment());
                totalPosteEntretien = safeFloat(res.getTotalPosteEntretien());
                totalPosteMobilier = safeFloat(res.getTotalPosteMobilier());
            }
        }

        Float totalEmissionGESParking = 0.0f;
        if (parkingVoirieOngletId != null) {
            var res = parkingVoirieOngletService.getParkingVoirieResult(parkingVoirieOngletId);
            if (res != null) {
                totalEmissionGESParking = safeFloat(res.getTotalEmissionGES());
            }
        }

        if (surfaceTotaleBatiments == 0.0f && batimentImmobilisationMobilierOngletId != null) {
            try {
                var batOnglet = batimentImmobilisationMobilierOngletService.getBatimentImmobilisationMobilierOngletById(batimentImmobilisationMobilierOngletId);
                if (batOnglet != null && batOnglet.getBatimentExistantOuNeufConstruits() != null) {
                    surfaceTotaleBatiments = batOnglet.getBatimentExistantOuNeufConstruits().stream()
                            .map(BatimentExistantOuNeufConstruit::getSurfaceEnM2)
                            .filter(Objects::nonNull)
                            .reduce(0f, Float::sum);
                }
            } catch (Exception ignored) {
            }
        }

        Float batimentParkingGlobal = totalPosteBatiment + totalPosteEntretien + totalPosteMobilier + totalEmissionGESParking;
        syntheseEGESResultatDto.setBatimentParkingGlobal(batimentParkingGlobal);
        syntheseEGESResultatDto.setBatimentParkingParUsager(calculerParUsager(batimentParkingGlobal, totalUsagers));

        // 8. Numérique
        Long numeriqueOngletId = onglets != null ? onglets.getNumeriqueOnglet() : null;
        Float numeriqueGlobal = 0.0f;
        if (numeriqueOngletId != null) {
            var res = numeriqueOngletService.getNumeriqueResultat(numeriqueOngletId);
            if (res != null) {
                numeriqueGlobal = safeFloat(res.getTotalNumerique());
            }
        }
        syntheseEGESResultatDto.setNumeriqueGlobal(numeriqueGlobal);
        syntheseEGESResultatDto.setNumeriqueParUsager(calculerParUsager(numeriqueGlobal, totalUsagers));

        // 9. Autres immobilisations
        Long autreImmobilisationOngletId = onglets != null ? onglets.getAutreImmobilisationOnglet() : null;
        Float totalPostePhotovoltaique = 0.0f;
        Float totalPosteBatimentAutre = 0.0f;
        if (autreImmobilisationOngletId != null) {
            var res = autreImmobilisationOngletService.getAutreImmobilisationResultat(autreImmobilisationOngletId);
            if (res != null) {
                totalPostePhotovoltaique = safeFloat(res.getTotalPostePhotovoltaique());
                totalPosteBatimentAutre = safeFloat(res.getTotalPosteBatiment());
            }
        }
        Float autreImmobilisationGlobal = totalPostePhotovoltaique + totalPosteBatimentAutre;
        syntheseEGESResultatDto.setAutreImmobilisationGlobal(autreImmobilisationGlobal);
        syntheseEGESResultatDto.setAutreImmobilisationParUsager(calculerParUsager(autreImmobilisationGlobal, totalUsagers));

        // 10. Achats
        Long achatOngletId = onglets != null ? onglets.getAchatOnglet() : null;
        Float totalPosteAchat = 0.0f;
        Float totalPosteTextile = 0.0f;
        Float totalPosteRestauration = 0.0f;
        if (achatOngletId != null) {
            var res = achatOngletService.getAchatResultat(achatOngletId);
            if (res != null) {
                totalPosteAchat = safeFloat(res.getTotalPosteAchat());
                totalPosteTextile = safeFloat(res.getTotalPosteTextile());
                totalPosteRestauration = safeFloat(res.getTotalPosteRestauration());
            }
        }
        Float achatGlobal = totalPosteAchat + totalPosteTextile + totalPosteRestauration;
        syntheseEGESResultatDto.setAchatGlobal(achatGlobal);
        syntheseEGESResultatDto.setAchatParUsager(calculerParUsager(achatGlobal, totalUsagers));

        // 11. Déchets
        Long dechetOngletId = onglets != null ? onglets.getDechetOnglet() : null;
        Float dechetGlobal = 0.0f;
        Float totalEvite = 0.0f;
        if (dechetOngletId != null) {
            var res = dechetOngletService.getDechetResultat(dechetOngletId);
            if (res != null) {
                dechetGlobal = safeFloat(res.getTotalProduit());
                totalEvite = safeFloat(res.getTotalEvite());
            }
        }
        syntheseEGESResultatDto.setDechetGlobal(dechetGlobal);
        syntheseEGESResultatDto.setDechetParUsager(calculerParUsager(dechetGlobal, totalUsagers));

        // 12. Bilan global consolidé
        float bilanCarboneTotalGlobal = safeFloat(syntheseEGESResultatDto.getEmissionFugitivesGlobal())
                + safeFloat(syntheseEGESResultatDto.getEnergieGlobal())
                + safeFloat(syntheseEGESResultatDto.getMobiliteDomicileTravailGlobal())
                + safeFloat(syntheseEGESResultatDto.getAutreMobiliteFrGlobal())
                + safeFloat(syntheseEGESResultatDto.getMobiliteInternationalGlobal())
                + safeFloat(syntheseEGESResultatDto.getBatimentParkingGlobal())
                + safeFloat(syntheseEGESResultatDto.getNumeriqueGlobal())
                + safeFloat(syntheseEGESResultatDto.getAutreImmobilisationGlobal())
                + safeFloat(syntheseEGESResultatDto.getAchatGlobal())
                + safeFloat(syntheseEGESResultatDto.getDechetGlobal());

        syntheseEGESResultatDto.setBilanCarboneTotalGlobal(bilanCarboneTotalGlobal);
        syntheseEGESResultatDto.setBilanCarboneTotalParUsager(calculerParUsager(bilanCarboneTotalGlobal, totalUsagers));

        syntheseEGESResultatDto.setSurfaceTotaleBatiments(surfaceTotaleBatiments);
        syntheseEGESResultatDto.setConsoEnergieFinaleParM2(consoEnergieFinaleParM2);
        syntheseEGESResultatDto.setConsoEnergiePrimaireParM2(consoEnergiePrimaireParM2);
        syntheseEGESResultatDto.setIntensiteCarboneParM2(intensiteCarboneParM2);
        if (surfaceTotaleBatiments != null && surfaceTotaleBatiments > 0 && bilanCarboneTotalGlobal > 0) {
            syntheseEGESResultatDto.setBilanCarboneTotalParM2((bilanCarboneTotalGlobal * 1000f) / surfaceTotaleBatiments);
        } else {
            syntheseEGESResultatDto.setBilanCarboneTotalParM2(0.0f);
        }

        // 13. Calcul des Scopes
        float amontFioul = 571.0f;
        float amontBois = 0.0f;
        Float consoGaz = 0.0f, consoFioul = 0.0f, consoBois = 0.0f;
        Float consoGazOnglet = 0.0f, consoFioulOnglet = 0.0f, consoBoisOnglet = 0.0f;
        Float consoElecChauffage = 0.0f, consoElecSpecifique = 0.0f;
        Float consoElecChauffageOnglet = 0.0f, consoElecSpecifiqueOnglet = 0.0f;
        Float consoReseauVille = 0.0f, consoEau = 0.0f;

        if (energieOngletId != null) {
            var energieOnglet = energieOngletService.getEnergieOngletById(energieOngletId);
            if (energieOnglet != null) {
                if (energieOnglet.getUniteFioul() == EnumEnergie_UniteFioul.TONNE) {
                    amontFioul = 676.0f;
                } else if (energieOnglet.getUniteFioul() == EnumEnergie_UniteFioul.MWH_PCS) {
                    amontFioul = 37.0f;
                }

                if (energieOnglet.getUniteBois() == EnumEnergie_UniteBois.TONNE) {
                    amontBois = 51.1f;
                } else if (energieOnglet.getUniteBois() == EnumEnergie_UniteBois.MWH_PCS) {
                    amontBois = 16.4f;
                }

                consoGazOnglet = safeFloat(energieOnglet.getConsoGaz());
                consoFioulOnglet = safeFloat(energieOnglet.getConsoFioul());
                consoBoisOnglet = safeFloat(energieOnglet.getConsoBois());
                consoElecChauffageOnglet = safeFloat(energieOnglet.getConsoElecChauffage());
                consoElecSpecifiqueOnglet = safeFloat(energieOnglet.getConsoElecSpecifique());
            }

            var energieResultat = energieOngletService.getEnergieResultat(energieOngletId);
            if (energieResultat != null) {
                consoGaz = safeFloat(energieResultat.getConsoGaz());
                consoFioul = safeFloat(energieResultat.getConsoFioul());
                consoBois = safeFloat(energieResultat.getConsoBois());
                consoElecChauffage = safeFloat(energieResultat.getConsoElecChauffage());
                consoElecSpecifique = safeFloat(energieResultat.getConsoElecSpecifique());
                consoReseauVille = safeFloat(energieResultat.getConsoReseauVille());
                consoEau = safeFloat(energieResultat.getConsoEau());
            }
        }

        syntheseEGESResultatDto.setEmissionDirecteCombustion(
                consoGaz + consoFioul + consoBois
                - (float) (consoGazOnglet * 0.385 / 1000.0)
                - (float) (consoFioulOnglet * amontFioul / 1000.0)
                - (float) (consoBoisOnglet * amontBois / 1000.0)
        );
        syntheseEGESResultatDto.setEmissionDirecteMoteurThermique(totalEmissionGESPetrole);
        syntheseEGESResultatDto.setEmissionDirecteFugitives(emissionFugitivesGlobal);

        syntheseEGESResultatDto.setEmissionIndirecteConsoElec(
                consoElecChauffage + consoElecSpecifique
                - (float) (consoElecChauffageOnglet * 23.8 / 1000.0)
                - (float) (consoElecSpecifiqueOnglet * 13.8 / 1000.0)
                + totalEmissionGESElectrique
        );
        syntheseEGESResultatDto.setEmissionIndirecteConsoVapeurChaleurFroid(consoReseauVille);

        syntheseEGESResultatDto.setEmissionNonIncluseDansDirectOuIndirecte(
                (float) (consoGazOnglet * 0.385 / 1000.0)
                + (float) (consoFioulOnglet * amontFioul / 1000.0)
                + (float) (consoBoisOnglet * amontBois / 1000.0)
                + (float) (consoElecChauffageOnglet * 23.8 / 1000.0)
                + (float) (consoElecSpecifiqueOnglet * 13.8 / 1000.0)
        );

        syntheseEGESResultatDto.setAchatProduitOuService(totalPosteAchat + totalPosteTextile + totalPosteRestauration + consoEau);
        syntheseEGESResultatDto.setImmobilisationBien(
                totalPosteBatiment + totalPosteMobilier + totalPosteEntretien
                + totalEmissionGESParking + numeriqueGlobal + totalPostePhotovoltaique
                + totalPosteBatimentAutre + totalEmissionGESFabrication
        );
        syntheseEGESResultatDto.setDechet(dechetGlobal);
        syntheseEGESResultatDto.setDeplacementProfessionnel(autreMobFrTotal + mobiliteInternationalGlobal);
        syntheseEGESResultatDto.setDeplacementDomicileTravail(mobiliteDomicileTravailGlobal);

        float totalScope = safeFloat(syntheseEGESResultatDto.getEmissionDirecteCombustion())
                + safeFloat(syntheseEGESResultatDto.getEmissionDirecteMoteurThermique())
                + safeFloat(syntheseEGESResultatDto.getEmissionDirecteFugitives())
                + safeFloat(syntheseEGESResultatDto.getEmissionIndirecteConsoElec())
                + safeFloat(syntheseEGESResultatDto.getEmissionIndirecteConsoVapeurChaleurFroid())
                + safeFloat(syntheseEGESResultatDto.getEmissionNonIncluseDansDirectOuIndirecte())
                + safeFloat(syntheseEGESResultatDto.getAchatProduitOuService())
                + safeFloat(syntheseEGESResultatDto.getImmobilisationBien())
                + safeFloat(syntheseEGESResultatDto.getDechet())
                + safeFloat(syntheseEGESResultatDto.getDeplacementProfessionnel())
                + safeFloat(syntheseEGESResultatDto.getDeplacementDomicileTravail());

        syntheseEGESResultatDto.setBilanCarboneTotalScope(totalScope);
        syntheseEGESResultatDto.setEmissionEvitee(totalEvite);

        return syntheseEGESResultatDto;
    }

    private Float calculerParUsager(Float valeurGlobale, int totalUsagers) {
        if (totalUsagers <= 0 || valeurGlobale == null || !Float.isFinite(valeurGlobale)) {
            return null;
        }
        return (valeurGlobale * 1000f) / totalUsagers;
    }

    private float safeFloat(Float v) {
        return (v != null && Float.isFinite(v)) ? v : 0.0f;
    }
}