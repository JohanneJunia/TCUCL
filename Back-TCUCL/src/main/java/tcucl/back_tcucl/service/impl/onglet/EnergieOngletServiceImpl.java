package tcucl.back_tcucl.service.impl.onglet;

import org.springframework.stereotype.Service;
import tcucl.back_tcucl.dto.onglet.energie.EnergieOngletDto;
import tcucl.back_tcucl.dto.onglet.energie.EnergieResultatDto;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmission;
import tcucl.back_tcucl.entity.facteurEmission.FacteurEmissionParametre;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentExistantOuNeufConstruit;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentImmobilisationMobilierOnglet;
import tcucl.back_tcucl.entity.onglet.energie.EnergieOnglet;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_NomReseauVille;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteBois;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteFioul;
import tcucl.back_tcucl.entity.onglet.energie.enums.EnumEnergie_UniteGaz;
import tcucl.back_tcucl.manager.EnergieOngletManager;
import tcucl.back_tcucl.service.EnergieOngletService;
import tcucl.back_tcucl.service.FacteurEmissionService;

@Service
public class EnergieOngletServiceImpl implements EnergieOngletService {

    private final EnergieOngletManager energieOngletManager;
    private final FacteurEmissionService facteurEmissionService;

    public EnergieOngletServiceImpl(EnergieOngletManager energieOngletManager, FacteurEmissionService facteurEmissionService) {
        this.energieOngletManager = energieOngletManager;
        this.facteurEmissionService = facteurEmissionService;
    }

    @Override
    public EnergieOnglet getEnergieOngletById(Long ongletId) {
        return energieOngletManager.getEnergieOngletById(ongletId);
    }

    @Override
    public void updateEnergieOngletPartiel(Long ongletId, EnergieOngletDto energieOngletDto) {
        energieOngletManager.updateEnergieOngletPartiel(ongletId, energieOngletDto);
    }

    @Override
    public EnergieResultatDto getEnergieResultat(Long ongletId) {
        EnergieOnglet energieOnglet = energieOngletManager.getEnergieOngletById(ongletId);
        EnergieResultatDto energieResultatDto = new EnergieResultatDto();

        float consoGaz = energieOnglet.getConsoGaz() != null ? energieOnglet.getConsoGaz() : 0f;
        float consoFioul = energieOnglet.getConsoFioul() != null ? energieOnglet.getConsoFioul() : 0f;
        float consoBois = energieOnglet.getConsoBois() != null ? energieOnglet.getConsoBois() : 0f;
        float consoReseauVille = energieOnglet.getConsoReseauVille() != null ? energieOnglet.getConsoReseauVille() : 0f;
        float consoElecChauffage = energieOnglet.getConsoElecChauffage() != null ? energieOnglet.getConsoElecChauffage() : 0f;
        float consoElecSpecifique = energieOnglet.getConsoElecSpecifique() != null ? energieOnglet.getConsoElecSpecifique() : 0f;
        float consoEau = energieOnglet.getConsoEau() != null ? energieOnglet.getConsoEau() : 0f;

        FacteurEmission facteurEmission;
        if (energieOnglet.getUniteGaz() != null) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.GAZ, energieOnglet.getUniteGaz().getLibelle());
            energieResultatDto.setConsoGaz(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoGaz) / 1000 : 0f);
        } else {
            energieResultatDto.setConsoGaz(0f);
        }

        if (energieOnglet.getUniteFioul() != null) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.FIOUL, energieOnglet.getUniteFioul().getLibelle());
            energieResultatDto.setConsoFioul(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoFioul) / 1000 : 0f);
        } else {
            energieResultatDto.setConsoFioul(0f);
        }

        if (energieOnglet.getUniteBois() != null) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.BOIS_GRANULE_FRANCAIS, energieOnglet.getUniteBois().getLibelle());
            energieResultatDto.setConsoBois(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoBois) / 1000 : 0f);
        } else {
            energieResultatDto.setConsoBois(0f);
        }

        energieResultatDto.setConsoReseauVille(0f);
        if (energieOnglet.getNomReseauVille() == EnumEnergie_NomReseauVille.LILLE) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_LILLE, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_LILLE_.MWh_PCS);
            energieResultatDto.setConsoReseauVille(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoReseauVille) / 1000 : 0f);
        } else if (energieOnglet.getNomReseauVille() == EnumEnergie_NomReseauVille.LAMBERSAART) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_LAMBERSART, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_LAMBERSART_.MWh_PCS);
            energieResultatDto.setConsoReseauVille(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoReseauVille) / 1000 : 0f);
        } else if (energieOnglet.getNomReseauVille() == EnumEnergie_NomReseauVille.LOMME) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_LOMME_CAPINGHEM, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_LOMME_CAPINGHEM_.MWh_PCS);
            energieResultatDto.setConsoReseauVille(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoReseauVille) / 1000 : 0f);
        } else if (energieOnglet.getNomReseauVille() == EnumEnergie_NomReseauVille.ROUBAIX) {
            facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_ROUBAIX, FacteurEmissionParametre.ENERGIE_.RESEAU_DE_CHALEUR_ROUBAIX_.MWh_PCS);
            energieResultatDto.setConsoReseauVille(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoReseauVille) / 1000 : 0f);
        }

        facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.ELECTRICITE_USAGE_CHAUFFAGE, FacteurEmissionParametre.ENERGIE_.ELECTRICITE_USAGE_CHAUFFAGE_.MWh_PCS);
        energieResultatDto.setConsoElecChauffage(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoElecChauffage) / 1000 : 0f);

        facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.ELECTRICITE_TOUS_USAGE, FacteurEmissionParametre.ENERGIE_.ELECTRICITE_TOUS_USAGE_.MWh_PCS);
        energieResultatDto.setConsoElecSpecifique(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoElecSpecifique) / 1000 : 0f);

        facteurEmission = facteurEmissionService.findByCategorieAndTypeAndUnite(FacteurEmissionParametre.ENERGIE, FacteurEmissionParametre.ENERGIE_.EAU, FacteurEmissionParametre.ENERGIE_.EAU_.M3);
        energieResultatDto.setConsoEau(facteurEmission != null && facteurEmission.getFacteurEmission() != null ? (facteurEmission.getFacteurEmission() * consoEau) / 1000 : 0f);

        energieResultatDto.setTotalPosteFluides(
                energieResultatDto.getConsoGaz() +
                        energieResultatDto.getConsoFioul() +
                        energieResultatDto.getConsoBois() +
                        energieResultatDto.getConsoReseauVille() +
                        energieResultatDto.getConsoElecChauffage() +
                        energieResultatDto.getConsoElecSpecifique() +
                        energieResultatDto.getConsoEau());

        Float consoEnergieGaz = 0F;
        if (energieOnglet.getUniteGaz() == EnumEnergie_UniteGaz.M3) {
            consoEnergieGaz = consoGaz / 100;
        } else if (energieOnglet.getUniteGaz() == EnumEnergie_UniteGaz.MWH_PCS) {
            consoEnergieGaz = consoGaz;
        }

        Float consoEnergieFioul = 0F;
        if ((energieOnglet.getUniteFioul() == EnumEnergie_UniteFioul.TONNE) || (energieOnglet.getUniteFioul() == EnumEnergie_UniteFioul.M3)) {
            consoEnergieFioul = consoFioul * 10;
        } else if (energieOnglet.getUniteFioul() == EnumEnergie_UniteFioul.MWH_PCS) {
            consoEnergieFioul = consoFioul;
        }

        Float consoEnergieBois = 0F;
        if (energieOnglet.getUniteBois() == EnumEnergie_UniteBois.TONNE) {
            consoEnergieBois = consoBois * 4.5F;
        } else if (energieOnglet.getUniteBois() == EnumEnergie_UniteBois.MWH_PCS) {
            consoEnergieBois = consoBois;
        }

        Float consoEnergieReseauVille = consoReseauVille;
        Float consoElecChauff = consoElecChauffage;
        Float consoElecSpec = consoElecSpecifique;

        energieResultatDto.setConsoEnergieFinale(consoEnergieGaz +
                consoEnergieFioul +
                consoEnergieBois +
                consoEnergieReseauVille +
                consoElecChauff +
                consoElecSpec);

        energieResultatDto.setconsoEnergieSpecifique(consoElecSpec);
        energieResultatDto.setConsoEnergieChauffage(energieResultatDto.getConsoEnergieFinale() - energieResultatDto.getconsoEnergieSpecifique());

        float surfaceBatiment = 0f;
        BatimentImmobilisationMobilierOnglet batOnglet = energieOnglet.getOngletDeClass(BatimentImmobilisationMobilierOnglet.class);
        if (batOnglet != null && batOnglet.getBatimentExistantOuNeufConstruits() != null) {
            surfaceBatiment = batOnglet.getBatimentExistantOuNeufConstruits()
                    .stream()
                    .map(BatimentExistantOuNeufConstruit::getSurfaceEnM2)
                    .filter(surfaceEnM2 -> surfaceEnM2 != null)
                    .reduce(0f, Float::sum);
        }

        if (surfaceBatiment != 0) {
            energieResultatDto.setConsoEnergieFinaleParM2(energieResultatDto.getConsoEnergieFinale() * 1000 / surfaceBatiment);
            energieResultatDto.setConsoEnergiePrimaireParM2(((consoElecChauff + consoElecSpec) * 2.3f + (energieResultatDto.getConsoEnergieChauffage() - consoElecChauff)) * 1000f / surfaceBatiment);
            energieResultatDto.setIntensiteCarboneParM2((energieResultatDto.getConsoGaz()
                    + energieResultatDto.getConsoFioul()
                    + energieResultatDto.getConsoBois()
                    + energieResultatDto.getConsoReseauVille()
                    + energieResultatDto.getConsoElecChauffage()
                    + energieResultatDto.getConsoElecSpecifique()) * 1000f / surfaceBatiment);
        } else {
            energieResultatDto.setConsoEnergieFinaleParM2(0F);
            energieResultatDto.setConsoEnergiePrimaireParM2(0F);
            energieResultatDto.setIntensiteCarboneParM2(0F);
        }
        energieResultatDto.setSurfaceTotaleBatiments(surfaceBatiment);

        Float consoFinale = energieResultatDto.getConsoEnergieFinale();
        if (consoFinale != null && consoFinale > 0) {
            energieResultatDto.setIntensiteCarboneMoyenne((energieResultatDto.getConsoGaz()
                    + energieResultatDto.getConsoFioul()
                    + energieResultatDto.getConsoBois()
                    + energieResultatDto.getConsoReseauVille()
                    + energieResultatDto.getConsoElecChauffage()
                    + energieResultatDto.getConsoElecSpecifique()) * 1000f / consoFinale);
        } else {
            energieResultatDto.setIntensiteCarboneMoyenne(0F);
        }

        return energieResultatDto;
    }
}
