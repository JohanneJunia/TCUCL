package tcucl.back_tcucl.service;

import org.springframework.transaction.annotation.Transactional;
import tcucl.back_tcucl.dto.*;
import tcucl.back_tcucl.entity.Utilisateur;

import java.util.List;

public interface ParametreService {

    void changePassword(ChangePasswordDto requete);

    void modifierUtilisateurParUtilisateur(Long utilisateurId, ModificationUtilisateurParUtilisateurDto modificationUtilisateurParUtilisateurDto);

    void inscrireUtilisateur(InscriptionDto_SuperAdmin inscriptionDtoSuperAdmin);

    void modifierUtilisateurParAdmin(Long utilisateurId, ModificationUtilisateurParAdminDto modificationUtilisateurParAdminDto);

    void modifierEstAdmin(Long utilisateurId, Boolean estAdmin);

    void supprimerUtilisateur(Long utilisateurId);

    void creerEntiteEtAdmin(CreationEntiteEtAdminDto_SuperAdmin creationEntiteEtAdminDto_superAdmin);

    void creerAnneeSuivante();

    List<Utilisateur> getAllUtilisateurParEntiteId(Long entiteId);

    Boolean peutCreerUneNouvelleAnnee();

    List<EntiteNomIdDto> getAllEntiteNomId();

    void completerAnneesManquantes();
}
