package tcucl.back_tcucl.entity.onglet.emissionFugitive;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import tcucl.back_tcucl.entity.onglet.emissionFugitive.enums.EnumEmissionFugitive_TypeFluide;
import tcucl.back_tcucl.entity.onglet.emissionFugitive.enums.EnumEmissionFugitive_TypeMachine;

@Entity
@Table(name = "machine_emission_fugitive")
public class MachineEmissionFugitive {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descriptionMachine;
    private Integer valeurEnumTypeFluide;
    private Float quantiteFluideKg;
    private Boolean tauxDeFuiteConnu;
    private Float tauxDeFuite;
    private Integer valeurEnumTypeMachine;

    @AssertTrue(message = "Le type de machine doit être vide si le taux de fuite est connu.")
    public Boolean assertTypeMachineVideSiTauxConnu() {
        if (Boolean.TRUE.equals(tauxDeFuiteConnu)) {
            return valeurEnumTypeMachine == null
                    || valeurEnumTypeMachine.equals(EnumEmissionFugitive_TypeMachine.NA.getCode());
        }
        return true;
    }
    @AssertTrue(message = "Le taux de fuite doit être vide ou égal à 0 si le taux de fuite n’est pas connu.")
    public Boolean assertTauxVideSiTauxInconnu() {
        if (Boolean.FALSE.equals(tauxDeFuiteConnu)) {
            return tauxDeFuite == null || tauxDeFuite == 0.0f;
        }
        return true;
    }
    @AssertTrue(message = "Le type de machine doit être renseigné si le taux de fuite n’est pas connu.")
    public Boolean assertTypeMachineRenseigneSiTauxInconnu() {
        if (Boolean.FALSE.equals(tauxDeFuiteConnu)) {
            return valeurEnumTypeMachine != null
                    && !valeurEnumTypeMachine.equals(EnumEmissionFugitive_TypeMachine.NA.getCode());
        }
        return true;
    }
    @AssertTrue(message = "L'information sur la connaissance du taux de fuite doit être renseignée.")
    public Boolean assertTauxConnuRenseigne() {
        return tauxDeFuiteConnu != null;
    }



    public EnumEmissionFugitive_TypeMachine getTypeMachine() {
        return this.valeurEnumTypeMachine != null ? EnumEmissionFugitive_TypeMachine.fromCode(this.valeurEnumTypeMachine) : null;
    }

    public void setTypeMachine(EnumEmissionFugitive_TypeMachine valeur) {
        this.valeurEnumTypeMachine = valeur.getCode();
    }


    public EnumEmissionFugitive_TypeFluide getTypeFluide() {
        return this.valeurEnumTypeFluide != null ? EnumEmissionFugitive_TypeFluide.fromCode(this.valeurEnumTypeFluide) : null ;
    }

    public void setTypeFluide(EnumEmissionFugitive_TypeFluide valeur) {
        this.valeurEnumTypeFluide = valeur.getCode();
    }


    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getDescriptionMachine() {
        return descriptionMachine;
    }

    public void setDescriptionMachine(String descriptionMachine) {
        this.descriptionMachine = descriptionMachine;
    }


    public Float getQuantiteFluideKg() {
        return quantiteFluideKg;
    }

    public void setQuantiteFluideKg(Float quantiteFluideKg) {
        this.quantiteFluideKg = quantiteFluideKg;
    }

    public boolean getTauxDeFuiteConnu() {
        return tauxDeFuiteConnu;
    }

    public void setTauxDeFuiteConnu(Boolean tauxDeFuiteConnu) {
        this.tauxDeFuiteConnu = tauxDeFuiteConnu;
    }

    public void setTauxDeFuiteConnu(boolean tauxDeFuiteConnu) {
        this.tauxDeFuiteConnu = tauxDeFuiteConnu;
    }

    public Float getTauxDeFuite() {
        return tauxDeFuite;
    }

    public void setTauxDeFuite(Float tauxDeFuite) {
        this.tauxDeFuite = tauxDeFuite;
    }
}
