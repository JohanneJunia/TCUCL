package tcucl.back_tcucl.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tcucl.back_tcucl.config.AnneeConfig;
import tcucl.back_tcucl.dto.*;
import tcucl.back_tcucl.entity.Annee;
import tcucl.back_tcucl.entity.Entite;
import tcucl.back_tcucl.entity.Utilisateur;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentImmobilisationMobilierOnglet;
import tcucl.back_tcucl.entity.onglet.emissionFugitive.EmissionFugitiveOnglet;
import tcucl.back_tcucl.dto.onglet.emissionFugitive.MachineEmissionFugitiveDto;
import tcucl.back_tcucl.exceptionPersonnalisee.AnneeUniversitaireDejaCreeException;
import tcucl.back_tcucl.service.*;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static tcucl.back_tcucl.Constante.*;

@Service
public class ParametreServiceImpl implements ParametreService {

    private static final Logger log = LoggerFactory.getLogger(ParametreServiceImpl.class);
    private final EntiteService entiteService;
    private final UtilisateurService utilisateurService;
    private final ApplicationParamService applicationParamService;

    public ParametreServiceImpl(EntiteService entiteService, UtilisateurService utilisateurService, AuthentificationService authentificationService, ApplicationParamService applicationParamService) {
        this.entiteService = entiteService;
        this.utilisateurService = utilisateurService;
        this.applicationParamService = applicationParamService;
    }

    @Override
    public void inscrireUtilisateur(InscriptionDto_SuperAdmin inscriptionDtoSuperAdmin) {
        utilisateurService.inscrireUtilisateur(inscriptionDtoSuperAdmin);
    }

    @Override
    public void modifierEstAdmin(Long utilisateurId, Boolean estAdmin) {
        utilisateurService.modifierEstAdmin(utilisateurId, estAdmin);
    }

    @Override
    public void supprimerUtilisateur(Long utilisateurId) {
        utilisateurService.supprimerUtilisateur(utilisateurId);
    }

    @Override
    public void modifierUtilisateurParAdmin(Long utilisateurId, ModificationUtilisateurParAdminDto modificationUtilisateurParAdminDto) {
        utilisateurService.modifierUtilisateurParAdmin(utilisateurId, modificationUtilisateurParAdminDto);
    }

    @Override
    public void changePassword(ChangePasswordDto changePasswordDto) {
        utilisateurService.changePassword(changePasswordDto);
    }


    //Le transactionnal permet le rollback de l'opération si une exception est levée
    //ex: si l'inscription de l'utilisateur échoue, l'entité ne sera pas créée
    @Transactional
    @Override
    public void creerEntiteEtAdmin(CreationEntiteEtAdminDto_SuperAdmin creationEntiteEtAdminDto_superAdmin) {

        //Creation puis récupération de l'entite
        Entite entite = entiteService.creerEntite(creationEntiteEtAdminDto_superAdmin.getNom(), creationEntiteEtAdminDto_superAdmin.getType(), creationEntiteEtAdminDto_superAdmin.getEstSuperAdmin());

        //Inscription de l'utilisateur
        utilisateurService.inscrireUtilisateur(new InscriptionDto_SuperAdmin(
                creationEntiteEtAdminDto_superAdmin.getNomUtilisateur(),
                creationEntiteEtAdminDto_superAdmin.getPrenomUtilisateur(),
                creationEntiteEtAdminDto_superAdmin.getEmailUtilisateur(),
                creationEntiteEtAdminDto_superAdmin.getEstSuperAdmin() ? ADMIN_FALSE : ADMIN_TRUE,
                creationEntiteEtAdminDto_superAdmin.getEstSuperAdmin() ? SUPERADMIN_TRUE : SUPERADMIN_FALSE,
                entite.getId()
        ));
    }

    @Override
    public List<Utilisateur> getAllUtilisateurParEntiteId(Long entiteId) {
        return utilisateurService.getAllUtilisateurParEntiteId(entiteId);
    }

    @Override
    public void modifierUtilisateurParUtilisateur(Long utilisateurId, ModificationUtilisateurParUtilisateurDto modificationUtilisateurParUtilisateurDto) {
        utilisateurService.modifierUtilisateurParUtilisateur(utilisateurId, modificationUtilisateurParUtilisateurDto);
    }

    @Transactional
    @Override
    public void creerAnneeSuivante() {

        int anneeUniversitaire = AnneeConfig.getAnneeCourante();
        boolean createdSomething = false;

        // on récupère toutes les entités (y compris l'entité SUPERADMIN id=1)
        List<Entite> entites = entiteService.getAllEntites();
        for (Entite entite : entites) {

            boolean dejaCreee = entite.getAnnees()
                    .stream()
                    .anyMatch(a -> a.getAnneeValeur() == anneeUniversitaire);
            if (dejaCreee) {
                continue;
            }

            Annee anneeActu = new Annee(anneeUniversitaire);
            Annee anneePrec = entite.getAnnees()
                    .stream()
                    .max(Comparator.comparingInt(Annee::getAnneeValeur))
                    .orElse(null);

            if (anneePrec != null) {
                BatimentImmobilisationMobilierOnglet anneePrecBatOnglet = anneePrec.getBatimentImmobilisationMobilierOnglet();
                BatimentImmobilisationMobilierOnglet anneeActuBatOnglet = anneeActu.getBatimentImmobilisationMobilierOnglet();
                EmissionFugitiveOnglet anneePrecEmissionFugitiveOnglet = anneePrec.getEmissionFugitiveOnglet();
                EmissionFugitiveOnglet anneeActuEmissionFugitiveOnglet = anneeActu.getEmissionFugitiveOnglet();

                // On ajoute les bâtiments existants de l'année précédente à l'année actuelle
                anneePrecBatOnglet.getBatimentExistantOuNeufConstruits()
                        .forEach(anneeActuBatOnglet::ajouterBatimentExistantOuNeufConstruit);

                // On ajoute les Entretiens courants de l'année précédente à l'année actuelle
                anneePrecBatOnglet.getEntretienCourants()
                        .forEach(anneeActuBatOnglet::ajouterEntretienCourant);

                // On réintroduit les machines de l'année précédente dans l'onglet Émissions fugitives
                anneePrecEmissionFugitiveOnglet.getMachinesEmissionFugitive()
                    .forEach(machinePrec -> {
                        MachineEmissionFugitiveDto machineDto = new MachineEmissionFugitiveDto(machinePrec);
                        machineDto.setId(null);
                        anneeActuEmissionFugitiveOnglet.ajouterMachineViaDto(machineDto);
                    });
            }

            entite.addAnnee(anneeActu); // gère la liaison bidirectionnelle
            entiteService.saveEntite(entite);
            createdSomething = true;
        }

        if (createdSomething) {
            applicationParamService.setDerniereAnneeCreee(anneeUniversitaire);
            log.info("Année universitaire {} créée pour toutes les entités.", anneeUniversitaire);
        } else {
            throw new AnneeUniversitaireDejaCreeException(anneeUniversitaire);
        }
    }

    @Override
    public Boolean peutCreerUneNouvelleAnnee() {
        return applicationParamService.getDerniereAnneeCreee() != AnneeConfig.getAnneeCourante();
    }

    @Override
    public List<EntiteNomIdDto> getAllEntiteNomId() {
        return entiteService.getAllEntites().stream().map(EntiteNomIdDto::new)
                .toList();
    }

    @Transactional
    @Override
    public void completerAnneesManquantes() {
        Integer derniereAnnee = applicationParamService.getDerniereAnneeCreee();
        if (derniereAnnee == null) {
            derniereAnnee = AnneeConfig.getAnneeCourante();
        }
        List<Entite> entites = entiteService.getAllEntites();
        for (Entite entite : entites) {
            if ("SUPERADMIN".equalsIgnoreCase(entite.getType())) {
                continue;
            }
            Set<Integer> existingYears = entite.getAnnees() != null
                    ? entite.getAnnees().stream().map(Annee::getAnneeValeur).collect(Collectors.toSet())
                    : Set.of();
            boolean modified = false;
            for (int y = 2019; y <= derniereAnnee; y++) {
                if (!existingYears.contains(y)) {
                    Annee annee = new Annee(y);
                    entite.addAnnee(annee);
                    modified = true;
                    log.info("INIT : Année historique manquante {} créée pour l'entité '{}'", y, entite.getNom());
                }
            }
            if (modified) {
                entiteService.saveEntite(entite);
            }
        }
    }
}
