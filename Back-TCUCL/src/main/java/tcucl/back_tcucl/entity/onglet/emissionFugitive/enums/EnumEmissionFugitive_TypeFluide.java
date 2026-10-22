package tcucl.back_tcucl.entity.onglet.emissionFugitive.enums;

public enum EnumEmissionFugitive_TypeFluide {
    CH4(0,"CH4"),
    N20(1,"N20"),
    R134a(2,"R134a"),
    R404a(3,"R404a"),
    R407a(4,"R407a"),
    R407c(5,"R407c"),
    R410a(6,"R410a"),
    R417a(7,"R417a"),
    R422a(8,"R422a"),
    R422d(9,"R422d"),
    R427a(10,"R427a"),
    R507(11,"R507"),
    R507a(12,"R507a"),
    HFC_125(13,"HFC – 125"),
    HFC_134(14,"HFC – 134"),
    HFC_134a(15,"HFC – 134a"),
    HFC_143(16,"HFC – 143"),
    HFC_143a(17,"HFC – 143a"),
    HFC_152a(18,"HFC – 152a"),
    HFC_227ea(19,"HFC – 227ea"),
    HFC_23(20,"HFC – 23"),
    HFC_236fa(21,"HFC – 236fa"),
    HFC_245ca(22,"HFC – 245ca"),
    HFC_32(23,"HFC – 32"),
    HFC_41(24,"HFC – 41"),
    HFC_43_10mee(25,"HFC – 43 – 10mee"),
    PERFLUOROBUTANE_R3110(26,"Perfluorobutane = R3110"),
    PERFLUOROMETHANE_R14(27,"Perfluoromethane = R14"),
    PERFLUOROPROPANE_R218(28,"Perfluoropropane = R21"),
    PERFLUOROPENTANE_R4112(29,"Perfluoropentane = R4112"),
    PERFLUOROCYCLOBUTANE_R318(30,"Perfluorocyclobutane = R31"),
    PERFLUOROETHANE_R116(31,"Perfluoroethane = R116"),
    PERFLUOROHEXANE_R5114(32,"Perfluorohexane = R5114"),
    SF6(33,"SF6"),
    NF3(34,"NF3"),
    R11_CFC_HORS_KYOTO(35,"R11 - CFC hors kyoto"),
    R12_CFC_HORS_KYOTO(36,"R12 - CFC hors kyoto"),
    R113(37,"R113"),
    R114(38,"R114"),
    R115(39,"R115"),
    R122(40,"R122"),
    R122a(41,"R122a"),
    R123(42,"R123"),
    R123a(43,"R123a"),
    R124(44,"R124"),
    R13(45,"R13"),
    R132c(46,"R132c"),
    R141b(47,"R141b"),
    R142b(48,"R142b"),
    R21(49,"R21"),
    R225ca(50,"R225ca"),
    R225cb(51,"R225cb"),
    R502_CFC_HORS_KYOTO(52,"R502 - CFC hors kyoto"),
    R22_HCFC_HORS_KYOTO(53,"R22 - HCFC hors kyoto"),
    R401a_HCFC_HORS_KYOTO(54,"R401a - HCFC hors kyoto"),
    R408a_HCFC_HORS_KYOTO(55,"R40_a - HCFC hors kyoto"),
    TETRACHLOROMETHANE(56,"Tétrachlorométhane"),
    NOx(57,"NOx"),
    BROMURE_DE_METHYLE(58,"Bromure de méthyle"),
    CHLOROFORME_DE_METHYLE(59,"Chloroforme de méthyle"),
    HALON_1211(60,"Halon 1211"),
    HALON_1301(61,"Halon 1301"),
    HALON_2402(62,"Halon 2402"),
    DICHLOROMETHANE(63,"Dichlorométhane");

    private final int code;
    private final String libelle;

    EnumEmissionFugitive_TypeFluide(int code, String libelle) {
        this.code = code;
        this.libelle = libelle;
    }

    public Integer getCode() {
        return code;
    }

    public String getLibelle() {
        return libelle;
    }

    public static EnumEmissionFugitive_TypeFluide fromCode(int code) {
        for (EnumEmissionFugitive_TypeFluide e : values()) {
            if (e.code == code) {
                return e;
            }
        }
        throw new IllegalArgumentException("Code invalide : " + code);
    }
    public static EnumEmissionFugitive_TypeFluide fromLibelle(String libelle) {
        for (EnumEmissionFugitive_TypeFluide e : values()) {
            if (e.libelle == libelle) {
                return e;
            }
        }
        throw new IllegalArgumentException("Code invalide : " + libelle);
    }
}
