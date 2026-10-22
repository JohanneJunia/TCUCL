export interface NumeriqueResultat {
  resultatsEquipementsNumeriques: Record<number, number>;
  empreinteCarboneEquipements?: number | null;
  methodeSimplifieeResultat: number | null;
  empreinteCarboneDataCenter: number | null;
  empreinteCarboneDataCenterEtReseaux: number | null;
  totalNumerique: number | null;
}
