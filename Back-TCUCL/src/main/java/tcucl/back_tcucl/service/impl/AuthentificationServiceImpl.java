package tcucl.back_tcucl.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import tcucl.back_tcucl.config.JwtUtils;
import tcucl.back_tcucl.dto.*;
import tcucl.back_tcucl.entity.Utilisateur;
import tcucl.back_tcucl.exceptionPersonnalisee.MauvaisIdentifiantsException;
import tcucl.back_tcucl.service.UtilisateurService;
import tcucl.back_tcucl.service.AuthentificationService;

import java.util.HashMap;
import java.util.Map;

import static tcucl.back_tcucl.Constante.*;

@Service
public class AuthentificationServiceImpl implements AuthentificationService {

    Logger logger = LoggerFactory.getLogger(AuthentificationServiceImpl.class);

    private final UtilisateurService utilisateurService;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthentificationServiceImpl(UtilisateurService utilisateurService,
                                       JwtUtils jwtUtils,
                                       AuthenticationManager authenticationManager
    ) {
        this.utilisateurService = utilisateurService;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public void changePassword(ChangePasswordDto changePasswordDto) {
        utilisateurService.changePassword(changePasswordDto);
    }

    @Override
    public Map<String, Object> connexion(ConnexionDto connexionDto) {
    
        Utilisateur utilisateur;
        try {
            utilisateur = utilisateurService.getUtilisateurParEmail(connexionDto.getEmail());
        } catch (Exception e) {
            logger.error("Authentification : Erreur lors de la récupération de l'utilisateur : " + connexionDto.getEmail());
            throw new MauvaisIdentifiantsException();
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(connexionDto.getEmail(), connexionDto.getMdp())
            );
            logger.info("Authentification Spring Security réussie pour l'utilisateur: " + connexionDto.getEmail());


            if (authentication.isAuthenticated()) {
                Map<String, Object> authData = new HashMap<>();

                    authData.put(JETON, jwtUtils.generateToken(connexionDto.getEmail()));
                    logger.info("Token JWT généré pour l'utilisateur: " + connexionDto.getEmail());

                    UtilisateurDto utilisateurDto = new UtilisateurDto(utilisateur);

                    authData.put("user", utilisateurDto);

                return authData;
            } else {
                logger.error("Échec d'authentification pour l'utilisateur : " + connexionDto.getEmail());
                throw new MauvaisIdentifiantsException();
            }
        } catch (Exception e) {
            e.printStackTrace(); logger.error("Erreur exacte:", e);
            throw new MauvaisIdentifiantsException();
        }
    }



}
