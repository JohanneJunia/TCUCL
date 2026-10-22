package tcucl.back_tcucl.entity.onglet.numerique;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import tcucl.back_tcucl.entity.onglet.numerique.enums.EnumNumerique_Equipement;

@Entity
@Table(name = "equipement_numerique")
public class EquipementNumerique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer valeurEnumEquipement;
    private Integer nombre;
    private Integer dureeAmortissement;
    private Boolean emissionsGesPrecisesConnues;
    private Float emissionsReellesParProduitKgCO2e;

    @AssertTrue(message = "L'indicateur 'emissionsGesPrecisesConnues' doit être renseigné.")
    public boolean isEmissionsConnuesNonNull() {
        return emissionsGesPrecisesConnues != null;
    }

    @AssertTrue(message = "Si les émissions GES sont connues, la valeur doit être renseignée et > 0.")
    public boolean isValeurPresenteSiConnue() {
        if (Boolean.TRUE.equals(emissionsGesPrecisesConnues)) {
            return emissionsReellesParProduitKgCO2e != null && emissionsReellesParProduitKgCO2e > 0.0f;
        }
        return true;
    }

    @AssertTrue(message = "Si les émissions GES ne sont pas connues, la valeur doit être nulle ou 0.")
    public boolean isValeurVideSiInconnue() {
        if (Boolean.FALSE.equals(emissionsGesPrecisesConnues)) {
            return emissionsReellesParProduitKgCO2e == null || emissionsReellesParProduitKgCO2e == 0.0f;
        }
        return true;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getNombre() {
        return nombre != null ? nombre : 0;
    }

    public void setNombre(int nombre) {
        this.nombre = nombre;
    }

    public int getDureeAmortissement() {
        return dureeAmortissement != null ? dureeAmortissement : 0;
    }

    public void setDureeAmortissement(int dureeAmortissement) {
        this.dureeAmortissement = dureeAmortissement;
    }

    public Boolean getEmissionsGesPrecisesConnues() {
        return emissionsGesPrecisesConnues;
    }

    public void setEmissionsGesPrecisesConnues(Boolean emissionsGesPrecisesConnues) {
        this.emissionsGesPrecisesConnues = emissionsGesPrecisesConnues;
    }

    public Float getEmissionsReellesParProduitKgCO2e() {
        return emissionsReellesParProduitKgCO2e;
    }

    public void setEmissionsReellesParProduitKgCO2e(Float emissionsReellesParProduitKgCO2e) {
        this.emissionsReellesParProduitKgCO2e = emissionsReellesParProduitKgCO2e;
    }

    public void setEquipement(EnumNumerique_Equipement valeur) {
        this.valeurEnumEquipement = valeur.getCode();
    }

    public EnumNumerique_Equipement getEquipement() {
        return this.valeurEnumEquipement != null ? EnumNumerique_Equipement.fromCode(this.valeurEnumEquipement) : null;
    }
}
