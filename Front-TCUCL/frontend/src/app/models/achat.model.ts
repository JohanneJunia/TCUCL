import { ACHAT_RESTAURATION_METHODE } from './enums/achat.enum';

export interface AchatConsommable {
  papier_T?: number | null;
  papier_nb?: number | null;
  livres_T?: number | null;
  livres_nb?: number | null;
  cartonNeuf_T?: number | null;
  cartonRecycle_T?: number | null;
  petitesFournitures_Eur?: number | null;
  nbFeuillesImprimeesJetEncre_Nb?: number | null;
  nbFeuillesImprimeesToner_Nb?: number | null;
  produitsPharmaceutiques_Eur?: number | null;
  services_imprimerie_publicite_architecture_ingenierie_maintenance_multi_technique_des_batiments?: number | null;
  service_Enseignement?: number | null;
  service_Produits_informatiques_electroniques_et_optiques?: number | null;
  service_Reparation_et_installation_de_machines_et_d_equipements?: number | null;
  service_Transport_terrestre?: number | null;
  service_hebergement_et_restauration?: number | null;
  service_de_telecommunications?: number | null;
}

export interface AchatTextile {
  chemise_nb?: number | null;
  polaire_nb?: number | null;
  Pull_Acrylique_nb?: number | null;
  Pull_Coton_nb?: number | null;
  T_shirt_polyester_nb?: number | null;
  Jean_nb?: number | null;
  Sweat_nb?: number | null;
  Veste_Anorak_nb?: number | null;
  Manteau_nb?: number | null;
  Chaussure_nb?: number | null;
}

export interface AchatRestauration {
  methode?: ACHAT_RESTAURATION_METHODE | null;
  methodeRapideNombrePersonnesServiesRegimeClassique?: number | null;
  methodeRapideNombrePersonnesServiesRegimeFlexitarien?: number | null;
  nombreRepasServisDominanteAnimaleBoeuf?: number | null;
  nombreRepasServisDominanteAnimalePoulet?: number | null;
  nombreRepasServisDominanteVegetaleBoeuf?: number | null;
  nombreRepasServisDominanteVegetalePoulet?: number | null;
  nombreRepasServisDominanteClassiqueBoeuf?: number | null;
  nombreRepasServisDominanteClassiquePoulet?: number | null;
  nombreRepasServisRepasMoyen?: number | null;
  nombreRepasServisRepasVegetarien?: number | null;
  boeufAgneauMouton_Tonnes?: number | null;
  poulet_Tonnes?: number | null;
  cafe_Tonnes?: number | null;
  chocolat_Tonnes?: number | null;
  beurre_Tonnes?: number | null;
  viandesMoyenne_Tonnes?: number | null;
  produitsSucresMoyenne_Tonnes?: number | null;
  poissonsMoyenne_Tonnes?: number | null;
  fromagesMoyenne_Tonnes?: number | null;
  oleagineuxMoyenne_Tonnes?: number | null;
  matieresGrassesMoyenne_Tonnes?: number | null;
  boissonsMoyenne_Tonnes?: number | null;
  oeufs_Tonnes?: number | null;
  cerealesMoyenne_Tonnes?: number | null;
  legumesMoyenne_Tonnes?: number | null;
  fruitsMoyenne_Tonnes?: number | null;
  legumineuseMoyenne_Tonnes?: number | null;
}

export interface AchatOnglet {
  estTermine?: boolean;
  note?: string;
  achatConsommable: AchatConsommable;
  achatRestauration: AchatRestauration;
  achatTextile: AchatTextile;
}

export interface ResultatAchatDTO {
  totalPosteAchat?: number;
  totalPosteTextile?: number;
  totalPosteRestauration?: number;
  totalConsommable?: number;
  totalTextile?: number;
  totalRestauration?: number;
  totalAchats?: number;
  emissionPosteConsommable?: Record<string, number>;
  emissionPosteTextile?: Record<string, number>;
  emissionPosteRestauration?: Record<string, number>;
  [key: string]: any;
}
