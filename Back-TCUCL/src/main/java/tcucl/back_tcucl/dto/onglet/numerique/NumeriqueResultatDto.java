package tcucl.back_tcucl.dto.onglet.numerique;

import java.util.HashMap;
import java.util.Map;

public class NumeriqueResultatDto {

    private Map<Long, Float> resultatsEquipementsNumeriques = new HashMap<>();

    private Float empreinteCarboneEquipements = 0f;
    private Float methodeSimplifieeResultat = 0f;
    private Float empreinteCarboneDataCenter = 0f;
    private Float empreinteCarboneDataCenterEtReseaux = 0f;

    private Float totalNumerique = 0f;

    public NumeriqueResultatDto() {
    }

    public Map<Long, Float> getResultatsEquipementsNumeriques() {
        return resultatsEquipementsNumeriques;
    }

    public void setResultatsEquipementsNumeriques(Map<Long, Float> resultatsEquipementsNumeriques) {
        this.resultatsEquipementsNumeriques = resultatsEquipementsNumeriques;
    }

    public void addResultatEquipementNumerique(Long equipementId, Float resultat) {
        if (resultatsEquipementsNumeriques != null) {
            resultatsEquipementsNumeriques.put(equipementId, resultat);
        }
    }

    public Float getEmpreinteCarboneEquipements() {
        return empreinteCarboneEquipements;
    }

    public void setEmpreinteCarboneEquipements(Float empreinteCarboneEquipements) {
        this.empreinteCarboneEquipements = empreinteCarboneEquipements;
    }

    public Float getMethodeSimplifieeResultat() {
        return methodeSimplifieeResultat;
    }

    public void setMethodeSimplifieeResultat(Float methodeSimplifieeResultat) {
        this.methodeSimplifieeResultat = methodeSimplifieeResultat;
    }

    public Float getEmpreinteCarboneDataCenter() {
        return empreinteCarboneDataCenter;
    }

    public void setEmpreinteCarboneDataCenter(Float empreinteCarboneDataCenter) {
        this.empreinteCarboneDataCenter = empreinteCarboneDataCenter;
    }

    public Float getEmpreinteCarboneDataCenterEtReseaux() {
        return empreinteCarboneDataCenterEtReseaux;
    }

    public void setEmpreinteCarboneDataCenterEtReseaux(Float empreinteCarboneDataCenterEtReseaux) {
        this.empreinteCarboneDataCenterEtReseaux = empreinteCarboneDataCenterEtReseaux;
    }

    public Float getTotalNumerique() {
        return totalNumerique;
    }

    public void setTotalNumerique(Float totalNumerique) {
        this.totalNumerique = totalNumerique;
    }
}
