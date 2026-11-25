import {ONGLET_KEYS} from '../constants/onglet-keys';

const runtimeEnv = typeof window !== 'undefined' ? (window as any).__env : undefined;
const BASE_URL = (runtimeEnv?.apiBaseUrl as string) ?? 'https://trajectoirecarbone.univ-catholille.fr/api';

export const ApiEndpoints = {
  Onglets: {
    getAllIds: (entiteId: number) => `${BASE_URL}/general/${entiteId}`,
    getAllStatus: (entiteId: number, annee: number) =>
      `${BASE_URL}/general/${entiteId}/estTermineAnnee/${annee}`
  },

  GeneralOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.General}/${id}`,
    updateNombre: (id: string) => `${BASE_URL}/${ONGLET_KEYS.General}/${id}`,
  },

  EnergieOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Energie}/${id}`,
    updateConso: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Energie}/${id}`,
    getResult: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Energie}/${id}/resultat`,
  },

  EmissionFugitivesOnglet: {
    getMachineById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.EmissionsFugitives}/${id}`,
    addMachine: (id: string) => `${BASE_URL}/${ONGLET_KEYS.EmissionsFugitives}/${id}/machine`,
    deleteMachine: (id: string, idMachine: string) =>
      `${BASE_URL}/${ONGLET_KEYS.EmissionsFugitives}/${id}/machine/${idMachine}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.EmissionsFugitives}/${id}`,
    resultats: (id: string) => `${BASE_URL}/${ONGLET_KEYS.EmissionsFugitives}/${id}/resultat`,
  },

  DomTravOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.MobiliteDomTrav}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.MobiliteDomTrav}/${id}`,
    resultats: (id: string) => `${BASE_URL}/${ONGLET_KEYS.MobiliteDomTrav}/${id}/resultat`,
  },

  AutreMobFrOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.AutreMobFr}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.AutreMobFr}/${id}`,
    resultats: (id: string) => `${BASE_URL}/${ONGLET_KEYS.AutreMobFr}/${id}/resultat`,
  },

  DechetsOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Dechets}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Dechets}/${id}`,
    resultat: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Dechets}/${id}/resultat`
  },

  AchatsOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Achats}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Achats}/${id}`,
    resultat: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Achats}/${id}/resultat`
  },

  autreImmobilisationOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.AutreImmob}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.AutreImmob}/${id}`,
    resultat: (id: string) => `${BASE_URL}/${ONGLET_KEYS.AutreImmob}/${id}/resultat`
  },
  NumeriqueOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Numerique}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Numerique}/${id}`,
    addEquipement: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Numerique}/${id}/equipementNumerique`,
    deleteEquipement: (ongletId: string, equipId: string) =>
      `${BASE_URL}/${ONGLET_KEYS.Numerique}/${ongletId}/equipementNumerique/${equipId}`,
    updateEquipement: (ongletId: string, equipId: string) =>
      `${BASE_URL}/${ONGLET_KEYS.Numerique}/${ongletId}/equipementNumerique/${equipId}`,
    getResult: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Numerique}/${id}/resultat`
  },
  ParkingVoirieOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Parkings}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Parkings}/${id}`,
    addParking: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Parkings}/${id}/parkingVoirie`,
    deleteParking: (ongletId: string, parkingId: string) =>
      `${BASE_URL}/${ONGLET_KEYS.Parkings}/${ongletId}/parkingVoirie/${parkingId}`,
    updateParking: (ongletId: string, parkingId: string) =>
      `${BASE_URL}/${ONGLET_KEYS.Parkings}/${ongletId}/parkingVoirie/${parkingId}`,
    getResult: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Parkings}/${id}/resultat`
  },
  mobInternationaleOnglet: {
    getById: (id: string) => `${BASE_URL}/${ONGLET_KEYS.MobInternationale}/${id}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.MobInternationale}/${id}`,
    resultats: (id: string) => `${BASE_URL}/${ONGLET_KEYS.MobInternationale}/${id}/resultat`,
    import:(id: string | null) => `${BASE_URL}/${ONGLET_KEYS.MobInternationale}/${id}/import-voyage`,

  },
  BatimentsOnglet: {
    getBatimentImmobilisationMobilier: (id: string) =>
      `${BASE_URL}/${ONGLET_KEYS.Batiments}/${id}`,
    ajouterBatiment: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${id}/batimentExistantOuNeufConstruit`,
    supprimerBatiment: (tabId: string, batimentId: number) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${tabId}/batimentExistantOuNeufConstruit/${batimentId}`,

    ajouterEntretien: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${id}/entretienCourant`,
    supprimerEntretien: (tabId: string, entretienId: number) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${tabId}/entretienCourant/${entretienId}`,

    ajouterMobilier: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${id}/mobilierElectromenager`,
    supprimerMobilier: (tabId: string, mobilierId: number) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${tabId}/mobilierElectromenager/${mobilierId}`,
    update: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${id}`,
    resultats: (id: string) => `${BASE_URL}/${ONGLET_KEYS.Batiments}/${id}/resultat`,
  },
  AutoOnglet: {
    getById: (id: string) => `${BASE_URL}/vehiculeOnglet/${id}`,
    update: (id: string) => `${BASE_URL}/vehiculeOnglet/${id}`,
    resultats: (id: string) => `${BASE_URL}/vehiculeOnglet/${id}/resultat`
  },

  Utilisateur: {
    creerEntite: () => `${BASE_URL}/parametre/creer-entite`,
    modifierSesInfos: (utilisateurId: number) => `${BASE_URL}/parametre/modifier-utilisateur-utilisateur/${utilisateurId}`,
    recupererUtilisateurPourEntite: (entiteId: number) => `${BASE_URL}/parametre/utilisateur-entite/${entiteId}`,
    creerutilisateur: (entiteId: number) => `${BASE_URL}/parametre/inscription-utilisateur/${entiteId}`,
    updateAdminStatus: (utilisateurId: number) => `${BASE_URL}/parametre/modifier-est-admin/${utilisateurId}`,
    importerFichier:() => `${BASE_URL}/parametre/import-facteurs-emission`,
    getAllEntiteNomId:() => `${BASE_URL}/parametre/all-entite-nom-id`,
    deleterUser: (utilisateurId: number) => `${BASE_URL}/parametre/supprimer-utilisateur/${utilisateurId}`,
    changerMdp:()=>`${BASE_URL}/parametre/change-mdp`
  },

  SyntheseEges: {
    getByEntite: (entiteId: number, annee: number) =>
      `${BASE_URL}/synthese-eges/${entiteId}?annee=${annee}`,
    exportExcel: (entiteId: number, annee: number) =>
      `${BASE_URL}/synthese-eges/${entiteId}/export-excel?annee=${annee}`
  },

  auth: {
    connexion: () => `${BASE_URL}/auth/connexion`,
    forgotPassword: () => `${BASE_URL}/auth/forgot-password`,
    resetPassword: () => `${BASE_URL}/auth/reset-password`
  },
  
  Trajectoire: {
    getByEntite: (entiteId: number) => `${BASE_URL}/trajectoire/${entiteId}`,
    upsert: (entiteId: number) => `${BASE_URL}/trajectoire/${entiteId}`,
    getPostesDefaults: (entiteId: number) => `${BASE_URL}/trajectoire/${entiteId}/postes-defaults`,
    propagateGlobal: () => `${BASE_URL}/trajectoire/propagate-global`
  }
  ,
  OutilSuivi: {
    getByEntite: (entiteId: number) => `${BASE_URL}/outil-suivi/${entiteId}`
  }
}
  