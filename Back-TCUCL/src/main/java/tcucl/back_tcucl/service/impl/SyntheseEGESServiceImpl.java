package tcucl.back_tcucl.service.impl;

import org.springframework.stereotype.Service;
import tcucl.back_tcucl.dto.ListIdDto;
import tcucl.back_tcucl.dto.SyntheseEGESResultatDto;
import tcucl.back_tcucl.entity.onglet.GeneralOnglet;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteBois;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteFioul;
import tcucl.back_tcucl.service.*;


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

    public SyntheseEGESServiceImpl(AnneeService anneeService, GeneralOngletService generalOngletService, EnergieOngletService energieOngletService, AchatOngletService achatOngletService, AutreImmobilisationOngletService autreImmobilisationOngletService, AutreMobFrOngletService autreMobFrOngletService, BatimentImmobilisationMobilierOngletService batimentImmobilisationMobilierOngletService, DechetOngletService dechetOngletService, EmissionFugitiveOngletService emissionFugitiveOngletService, MobiliteDomicileTravailOngletService mobiliteDomicileTravailOngletService, MobInternationalOngletService mobInternationalOngletService, NumeriqueOngletService numeriqueOngletService, ParkingVoirieOngletService parkingVoirieOngletService, VehiculeOngletService vehiculeOngletService) {
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
        ListIdDto onglets = anneeService.getongletIdListForEntiteAndAnnee(entiteId, annee);
        SyntheseEGESResultatDto syntheseEGESResultatDto = new SyntheseEGESResultatDto();
        Long generalOngletId = onglets.getGeneralOnglet();
        GeneralOnglet generalOnglet = generalOngletService.getGeneralOngletById(generalOngletId);
        Integer nbEtudiant = generalOnglet != null ? generalOnglet.getNbEtudiant() : null;
        Integer nbSalarie = generalOnglet != null ? generalOnglet.getNbSalarie() : null;
        int totalUsagers = (nbEtudiant != null ? nbEtudiant : 0) + (nbSalarie != null ? nbSalarie : 0);
        syntheseEGESResultatDto.setEffectifTotal(totalUsagers);

        // Emission fugitives
        Long emissionFugitiveOngletId = onglets.getEmissionFugitiveOnglet();
        Float emissionFugitivesGlobal = emissionFugitiveOngletService
                .getEmissionFugitiveResult(emissionFugitiveOngletId)
                .getTotalEmissionGES();
        emissionFugitivesGlobal = (emissionFugitivesGlobal != null) ? emissionFugitivesGlobal : 0.0f;
        syntheseEGESResultatDto.setEmissionFugitivesGlobal(emissionFugitivesGlobal);
        syntheseEGESResultatDto.setEmissionFugitivesParUsager(calculerParUsager(emissionFugitivesGlobal, totalUsagers));

        // Energie
        Long energieOngletId = onglets.getEnergieOnglet();
        Float energieGlobal = energieOngletService
                .getEnergieResultat(energieOngletId)
                .getTotalPosteFluides();
        energieGlobal = (energieGlobal != null) ? energieGlobal : 0.0f;
        syntheseEGESResultatDto.setEnergieGlobal(energieGlobal);
        syntheseEGESResultatDto.setEnergieParUsager(calculerParUsager(energieGlobal, totalUsagers));

        // Mobilité domicile travail
        Long mobiliteDomicileTravailOngletId = onglets.getMobiliteDomicileTravailOnglet();
        Float mobiliteDomicileTravailGlobal = mobiliteDomicileTravailOngletService
                .getMobiliteDomicileTravailResultat(mobiliteDomicileTravailOngletId)
                .getTotalPosteMobiliteFrance();
        mobiliteDomicileTravailGlobal = (mobiliteDomicileTravailGlobal != null) ? mobiliteDomicileTravailGlobal : 0.0f;
        syntheseEGESResultatDto.setMobiliteDomicileTravailGlobal(mobiliteDomicileTravailGlobal);
        syntheseEGESResultatDto.setMobiliteDomicileTravailParUsager(calculerParUsager(mobiliteDomicileTravailGlobal, totalUsagers));

        // Autre mobilité France
        Long autreMobFrOngletId = onglets.getAutreMobFrOnglet();
        Long vehiculeOngletId = onglets.getVehiculeOnglet();

        Float autreMobFrTotal = autreMobFrOngletService
                .getAutreMobFrResultat(autreMobFrOngletId)
                .getTotalPosteMobiliteFrance();
        autreMobFrTotal = (autreMobFrTotal != null) ? autreMobFrTotal : 0.0f;

        Float vehiculeTotal = vehiculeOngletService
                .getVehiculeResult(vehiculeOngletId)
                .getTotalEmissionGES();
        vehiculeTotal = (vehiculeTotal != null) ? vehiculeTotal : 0.0f;

        Float autreMobiliteFrGlobal = autreMobFrTotal + vehiculeTotal;
        syntheseEGESResultatDto.setAutreMobiliteFrGlobal(autreMobiliteFrGlobal);
        syntheseEGESResultatDto.setAutreMobiliteFrParUsager(calculerParUsager(autreMobiliteFrGlobal, totalUsagers));

        // Mobilité internationale
        Long mobInternationalOngletId = onglets.getMobInternationalOnglet();
        Float emissionGesProEurope = mobInternationalOngletService
                .getMobInternationalResultat(mobInternationalOngletId)
                .getEmissionGesProEurope();
        emissionGesProEurope = (emissionGesProEurope != null) ? emissionGesProEurope : 0.0f;

        Float emissionGesStageEurope = mobInternationalOngletService
                .getMobInternationalResultat(mobInternationalOngletId)
                .getEmissionGesStageEurope();
        emissionGesStageEurope = (emissionGesStageEurope != null) ? emissionGesStageEurope : 0.0f;

        Float emissionGesSemestreEurope = mobInternationalOngletService
                .getMobInternationalResultat(mobInternationalOngletId)
                .getEmissionGesSemestresEtudiantsEurope();
        emissionGesSemestreEurope = (emissionGesSemestreEurope != null) ? emissionGesSemestreEurope : 0.0f;

        Float emissionGesProHorsEurope = mobInternationalOngletService
                .getMobInternationalResultat(mobInternationalOngletId)
                .getEmissionGesProHorsEurope();
        emissionGesProHorsEurope = (emissionGesProHorsEurope != null) ? emissionGesProHorsEurope : 0.0f;

        Float emissionGesStagesHorsEurope = mobInternationalOngletService
                .getMobInternationalResultat(mobInternationalOngletId)
                .getEmissionGesStagesHorsEurope();
        emissionGesStagesHorsEurope = (emissionGesStagesHorsEurope != null) ? emissionGesStagesHorsEurope : 0.0f;

        Float emissionGesSemestresHorsEurope = mobInternationalOngletService
                .getMobInternationalResultat(mobInternationalOngletId)
                .getEmissionGesSemestresEtudiantsHorsEurope();
        emissionGesSemestresHorsEurope = (emissionGesSemestresHorsEurope != null) ? emissionGesSemestresHorsEurope : 0.0f;

        Float mobiliteInternationalGlobal = emissionGesProEurope + emissionGesStageEurope + emissionGesSemestreEurope +
                emissionGesProHorsEurope + emissionGesStagesHorsEurope + emissionGesSemestresHorsEurope;
        syntheseEGESResultatDto.setMobiliteInternationalGlobal(mobiliteInternationalGlobal);
        syntheseEGESResultatDto.setMobiliteInternationalParUsager(calculerParUsager(mobiliteInternationalGlobal, totalUsagers));

        // Immobilisation bâtiment mobilier (incluant parking)
        Long batimentImmobilisationMobilierOngletId = onglets.getBatimentImmobilisationMobilierOnglet();
        Long parkingVoirieOngletId = onglets.getParkingVoirieOnglet();

        Float totalPosteBatiment = batimentImmobilisationMobilierOngletService
                .getBatimentImmobilisationMobilierResult(batimentImmobilisationMobilierOngletId)
                .getTotalPosteBatiment();
        totalPosteBatiment = (totalPosteBatiment != null) ? totalPosteBatiment : 0.0f;

        Float totalPosteEntretien = batimentImmobilisationMobilierOngletService
                .getBatimentImmobilisationMobilierResult(batimentImmobilisationMobilierOngletId)
                .getTotalPosteEntretien();
        totalPosteEntretien = (totalPosteEntretien != null) ? totalPosteEntretien : 0.0f;

        Float totalPosteMobilier = batimentImmobilisationMobilierOngletService
                .getBatimentImmobilisationMobilierResult(batimentImmobilisationMobilierOngletId)
                .getTotalPosteMobilier();
        totalPosteMobilier = (totalPosteMobilier != null) ? totalPosteMobilier : 0.0f;

        Float totalEmissionGESParking = parkingVoirieOngletService
                .getParkingVoirieResult(parkingVoirieOngletId)
                .getTotalEmissionGES();
        totalEmissionGESParking = (totalEmissionGESParking != null) ? totalEmissionGESParking : 0.0f;

        Float batimentParkingGlobal = totalPosteBatiment + totalPosteEntretien + totalPosteMobilier + totalEmissionGESParking;
        syntheseEGESResultatDto.setBatimentParkingGlobal(batimentParkingGlobal);
        syntheseEGESResultatDto.setBatimentParkingParUsager(calculerParUsager(batimentParkingGlobal, totalUsagers));

        // Numérique
        Long numeriqueOngletId = onglets.getNumeriqueOnglet();
        Float numeriqueGlobal = numeriqueOngletService
                .getNumeriqueResultat(numeriqueOngletId)
                .getTotalNumerique();
        numeriqueGlobal = (numeriqueGlobal != null) ? numeriqueGlobal : 0.0f;
        syntheseEGESResultatDto.setNumeriqueGlobal(numeriqueGlobal);
        syntheseEGESResultatDto.setNumeriqueParUsager(calculerParUsager(numeriqueGlobal, totalUsagers));

        // Autres immobilisations
        Long autreImmobilisationOngletId = onglets.getAutreImmobilisationOnglet();
        Float totalPostePhotovoltaique = autreImmobilisationOngletService
                .getAutreImmobilisationResultat(autreImmobilisationOngletId)
                .getTotalPostePhotovoltaique();
        totalPostePhotovoltaique = (totalPostePhotovoltaique != null) ? totalPostePhotovoltaique : 0.0f;

        Float totalPosteBatimentAutre = autreImmobilisationOngletService
                .getAutreImmobilisationResultat(autreImmobilisationOngletId)
                .getTotalPosteBatiment();
        totalPosteBatimentAutre = (totalPosteBatimentAutre != null) ? totalPosteBatimentAutre : 0.0f;

        Float autreImmobilisationGlobal = totalPostePhotovoltaique + totalPosteBatimentAutre;
        syntheseEGESResultatDto.setAutreImmobilisationGlobal(autreImmobilisationGlobal);
        syntheseEGESResultatDto.setAutreImmobilisationParUsager(calculerParUsager(autreImmobilisationGlobal, totalUsagers));

        // Achats
        Long achatOngletId = onglets.getAchatOnglet();
        Float totalPosteAchat = achatOngletService
                .getAchatResultat(achatOngletId)
                .getTotalPosteAchat();
        totalPosteAchat = (totalPosteAchat != null) ? totalPosteAchat : 0.0f;

        Float totalPosteTextile = achatOngletService
                .getAchatResultat(achatOngletId)
                .getTotalPosteTextile();
        totalPosteTextile = (totalPosteTextile != null) ? totalPosteTextile : 0.0f;

        Float totalPosteRestauration = achatOngletService
                .getAchatResultat(achatOngletId)
                .getTotalPosteRestauration();
        totalPosteRestauration = (totalPosteRestauration != null) ? totalPosteRestauration : 0.0f;

        Float achatGlobal = totalPosteAchat + totalPosteTextile + totalPosteRestauration;
        syntheseEGESResultatDto.setAchatGlobal(achatGlobal);
        syntheseEGESResultatDto.setAchatParUsager(calculerParUsager(achatGlobal, totalUsagers));

        // Déchets
        Long dechetOngletId = onglets.getDechetOnglet();
        Float dechetGlobal = dechetOngletService
                .getDechetResultat(dechetOngletId)
                .getTotalProduit();
        dechetGlobal = (dechetGlobal != null) ? dechetGlobal : 0.0f;
        syntheseEGESResultatDto.setDechetGlobal(dechetGlobal);
        syntheseEGESResultatDto.setDechetParUsager(calculerParUsager(dechetGlobal, totalUsagers));

        syntheseEGESResultatDto.setBilanCarboneTotalGlobal(
                safeFloat(syntheseEGESResultatDto.getEmissionFugitivesGlobal())
                + safeFloat(syntheseEGESResultatDto.getEnergieGlobal())
                + safeFloat(syntheseEGESResultatDto.getMobiliteDomicileTravailGlobal())
                + safeFloat(syntheseEGESResultatDto.getAutreMobiliteFrGlobal())
                + safeFloat(syntheseEGESResultatDto.getMobiliteInternationalGlobal())
                + safeFloat(syntheseEGESResultatDto.getBatimentParkingGlobal())
                + safeFloat(syntheseEGESResultatDto.getNumeriqueGlobal())
                + safeFloat(syntheseEGESResultatDto.getAutreImmobilisationGlobal())
                + safeFloat(syntheseEGESResultatDto.getAchatGlobal())
                + safeFloat(syntheseEGESResultatDto.getDechetGlobal()));

        if (totalUsagers > 0) {
            syntheseEGESResultatDto.setBilanCarboneTotalParUsager(
                    safeFloat(syntheseEGESResultatDto.getEmissionFugitivesParUsager())
                    + safeFloat(syntheseEGESResultatDto.getEnergieParUsager())
                    + safeFloat(syntheseEGESResultatDto.getMobiliteDomicileTravailParUsager())
                    + safeFloat(syntheseEGESResultatDto.getAutreMobiliteFrParUsager())
                    + safeFloat(syntheseEGESResultatDto.getMobiliteInternationalParUsager())
                    + safeFloat(syntheseEGESResultatDto.getBatimentParkingParUsager())
                    + safeFloat(syntheseEGESResultatDto.getNumeriqueParUsager())
                    + safeFloat(syntheseEGESResultatDto.getAutreImmobilisationParUsager())
                    + safeFloat(syntheseEGESResultatDto.getAchatParUsager())
                    + safeFloat(syntheseEGESResultatDto.getDechetParUsager()));
        } else {
            syntheseEGESResultatDto.setBilanCarboneTotalParUsager(null);
        }

        float amontFioul = 0;
        if ((energieOngletService.getEnergieOngletById(energieOngletId).getUniteFioul() == EnumEnergie_UniteFioul.TONNE)) {
            amontFioul = 676;
        } else if ((energieOngletService.getEnergieOngletById(energieOngletId).getUniteFioul() == EnumEnergie_UniteFioul.MWH_PCS)) {
            amontFioul = 37;
        } else {
            amontFioul = 571;
        }

        float amontBois = 0;
        if ((energieOngletService.getEnergieOngletById(energieOngletId).getUniteBois() == EnumEnergie_UniteBois.TONNE)) {
            amontBois = 51.1F;
        } else if ((energieOngletService.getEnergieOngletById(energieOngletId).getUniteBois() == EnumEnergie_UniteBois.MWH_PCS)) {
            amontBois = 16.4F;
        }

        // Récupération des valeurs avec gestion des null pour les calculs d'émissions
        Float consoGaz = energieOngletService.getEnergieResultat(energieOngletId).getConsoGaz();
        consoGaz = (consoGaz != null) ? consoGaz : 0.0f;

        Float consoFioul = energieOngletService.getEnergieResultat(energieOngletId).getConsoFioul();
        consoFioul = (consoFioul != null) ? consoFioul : 0.0f;

        Float consoBois = energieOngletService.getEnergieResultat(energieOngletId).getConsoBois();
        consoBois = (consoBois != null) ? consoBois : 0.0f;

        Float consoGazOnglet = energieOngletService.getEnergieOngletById(energieOngletId).getConsoGaz();
        consoGazOnglet = (consoGazOnglet != null) ? consoGazOnglet : 0.0f;

        Float consoFioulOnglet = energieOngletService.getEnergieOngletById(energieOngletId).getConsoFioul();
        consoFioulOnglet = (consoFioulOnglet != null) ? consoFioulOnglet : 0.0f;

        Float consoBoisOnglet = energieOngletService.getEnergieOngletById(energieOngletId).getConsoBois();
        consoBoisOnglet = (consoBoisOnglet != null) ? consoBoisOnglet : 0.0f;

        Float consoElecChauffage = energieOngletService.getEnergieResultat(energieOngletId).getConsoElecChauffage();
        consoElecChauffage = (consoElecChauffage != null) ? consoElecChauffage : 0.0f;

        Float consoElecSpecifique = energieOngletService.getEnergieResultat(energieOngletId).getConsoElecSpecifique();
        consoElecSpecifique = (consoElecSpecifique != null) ? consoElecSpecifique : 0.0f;

        Float consoElecChauffageOnglet = energieOngletService.getEnergieOngletById(energieOngletId).getConsoElecChauffage();
        consoElecChauffageOnglet = (consoElecChauffageOnglet != null) ? consoElecChauffageOnglet : 0.0f;

        Float consoElecSpecifiqueOnglet = energieOngletService.getEnergieOngletById(energieOngletId).getConsoElecSpecifique();
        consoElecSpecifiqueOnglet = (consoElecSpecifiqueOnglet != null) ? consoElecSpecifiqueOnglet : 0.0f;

        Float consoReseauVille = energieOngletService.getEnergieResultat(energieOngletId).getConsoReseauVille();
        consoReseauVille = (consoReseauVille != null) ? consoReseauVille : 0.0f;

        Float consoReseauVilleOnglet = energieOngletService.getEnergieOngletById(energieOngletId).getConsoReseauVille();
        consoReseauVilleOnglet = (consoReseauVilleOnglet != null) ? consoReseauVilleOnglet : 0.0f;

        Float consoEau = energieOngletService.getEnergieResultat(energieOngletId).getConsoEau();
        consoEau = (consoEau != null) ? consoEau : 0.0f;

        Float totalEmissionGESPetrole = vehiculeOngletService.getVehiculeResult(vehiculeOngletId).getTotalEmissionGESPetrole();
        totalEmissionGESPetrole = (totalEmissionGESPetrole != null) ? totalEmissionGESPetrole : 0.0f;

        Float totalEmissionGESElectrique = vehiculeOngletService.getVehiculeResult(vehiculeOngletId).getTotalEmissionGESElectrique();
        totalEmissionGESElectrique = (totalEmissionGESElectrique != null) ? totalEmissionGESElectrique : 0.0f;

        Float totalEmissionGESFabrication = vehiculeOngletService.getVehiculeResult(vehiculeOngletId).getTotalEmissionGESFabrication();
        totalEmissionGESFabrication = (totalEmissionGESFabrication != null) ? totalEmissionGESFabrication : 0.0f;

        Float totalEvite = dechetOngletService.getDechetResultat(dechetOngletId).getTotalEvite();
        totalEvite = (totalEvite != null) ? totalEvite : 0.0f;

        syntheseEGESResultatDto.setEmissionDirecteCombustion((float) (consoGaz + consoFioul + consoBois
                - (consoGazOnglet * 0.385 / 1000)
                - (consoFioulOnglet * amontFioul / 1000)
                - (consoBoisOnglet * amontBois / 1000)));

        syntheseEGESResultatDto.setEmissionDirecteMoteurThermique(totalEmissionGESPetrole);
        syntheseEGESResultatDto.setEmissionDirecteFugitives(emissionFugitivesGlobal);

        syntheseEGESResultatDto.setEmissionIndirecteConsoElec((float) (consoElecChauffage + consoElecSpecifique
                - (consoElecChauffageOnglet * 23.8 / 1000)
                - (consoElecSpecifiqueOnglet * 13.8 / 1000)
                + totalEmissionGESElectrique));

        syntheseEGESResultatDto.setEmissionIndirecteConsoVapeurChaleurFroid(consoReseauVille);

        syntheseEGESResultatDto.setEmissionNonIncluseDansDirectOuIndirecte((float) ((consoGazOnglet * 0.385 / 1000)
                + (consoFioulOnglet * amontFioul / 1000)
                + (consoBoisOnglet * amontBois / 1000)
                + (consoReseauVilleOnglet * 0 / 1000)
                + (consoElecChauffageOnglet * 23.8 / 1000)
                + (consoElecSpecifiqueOnglet * 13.8 / 1000)
                + (consoReseauVilleOnglet * 0 / 1000)));

        syntheseEGESResultatDto.setAchatProduitOuService(totalPosteAchat + totalPosteTextile + totalPosteRestauration + consoEau);

        syntheseEGESResultatDto.setImmobilisationBien(totalPosteBatiment + totalPosteMobilier + totalPosteEntretien
                + totalEmissionGESParking + numeriqueGlobal + totalPostePhotovoltaique + totalPosteBatimentAutre + totalEmissionGESFabrication);

        syntheseEGESResultatDto.setDechet(dechetGlobal);
        syntheseEGESResultatDto.setDeplacementProfessionnel(autreMobFrTotal + mobiliteInternationalGlobal);
        syntheseEGESResultatDto.setDeplacementDomicileTravail(mobiliteDomicileTravailGlobal);

        syntheseEGESResultatDto.setBilanCarboneTotalScope(
                safeFloat(syntheseEGESResultatDto.getEmissionDirecteCombustion())
                + safeFloat(syntheseEGESResultatDto.getEmissionDirecteMoteurThermique())
                + safeFloat(syntheseEGESResultatDto.getEmissionDirecteFugitives())
                + safeFloat(syntheseEGESResultatDto.getEmissionIndirecteConsoElec())
                + safeFloat(syntheseEGESResultatDto.getEmissionIndirecteConsoVapeurChaleurFroid())
                + safeFloat(syntheseEGESResultatDto.getEmissionNonIncluseDansDirectOuIndirecte())
                + safeFloat(syntheseEGESResultatDto.getAchatProduitOuService())
                + safeFloat(syntheseEGESResultatDto.getImmobilisationBien())
                + safeFloat(syntheseEGESResultatDto.getDechet())
                + safeFloat(syntheseEGESResultatDto.getDeplacementProfessionnel())
                + safeFloat(syntheseEGESResultatDto.getDeplacementDomicileTravail()));

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
