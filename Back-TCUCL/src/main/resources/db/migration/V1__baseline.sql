--
-- PostgreSQL database dump
--


-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achat_consommable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achat_consommable (
    id bigint NOT NULL,
    carton_neuf_t real,
    carton_recycle_t real,
    livres_t real,
    livres_nb real,
    nb_feuilles_imprimees_jet_encre_nb real,
    nb_feuilles_imprimees_toner_nb real,
    papier_t real,
    papier_nb real,
    petites_fournitures_eur real,
    produits_pharmaceutiques_eur real,
    service_enseignement real,
    service_produits_informatiques_electroniques_et_optiques real,
    service_reparation_et_installation_de_machines_et_d_equipements real,
    service_transport_terrestre real,
    service_de_telecommunications real,
    service_hebergement_et_restauration real,
    services_imp_pub_archi_inge_maint_tech_bat real
);


--
-- Name: achat_consommable_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achat_consommable_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achat_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achat_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    achat_consommable_id bigint,
    achat_restauration_id bigint,
    achat_textile_id bigint
);


--
-- Name: achat_restauration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achat_restauration (
    id bigint NOT NULL,
    beurre_tonnes real,
    boeuf_agneau_mouton_tonnes real,
    boissons_moyenne_tonnes real,
    cafe_tonnes real,
    cereales_moyenne_tonnes real,
    chocolat_tonnes real,
    enum_valeur_methode integer,
    fromages_moyenne_tonnes real,
    fruits_moyenne_tonnes real,
    legumes_moyenne_tonnes real,
    legumineuse_moyenne_tonnes real,
    matieres_grasses_moyenne_tonnes real,
    methode_rapide_nombre_personnes_servies_regime_classique integer,
    methode_rapide_nombre_personnes_servies_regime_flexitarien integer,
    nombre_repas_servis_dominante_animale_boeuf integer,
    nombre_repas_servis_dominante_animale_poulet integer,
    nombre_repas_servis_dominante_classique_boeuf integer,
    nombre_repas_servis_dominante_classique_poulet integer,
    nombre_repas_servis_dominante_vegetale_boeuf integer,
    nombre_repas_servis_dominante_vegetale_poulet integer,
    nombre_repas_servis_repas_moyen integer,
    nombre_repas_servis_repas_vegetarien integer,
    oeufs_tonnes real,
    oleagineux_moyenne_tonnes real,
    poissons_moyenne_tonnes real,
    poulet_tonnes real,
    produits_sucres_moyenne_tonnes real,
    viandes_moyenne_tonnes real
);


--
-- Name: achat_restauration_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achat_restauration_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achat_textile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achat_textile (
    id bigint NOT NULL,
    chaussure_nb integer,
    chemise_nb integer,
    jean_nb integer,
    manteau_nb integer,
    polaire_nb integer,
    pull_acrylique_nb integer,
    pull_coton_nb integer,
    sweat_nb integer,
    t_shirt_polyester_nb integer,
    veste_anorak_nb integer
);


--
-- Name: achat_textile_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achat_textile_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: annee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annee (
    id bigint NOT NULL,
    annee_valeur integer NOT NULL,
    entite_id bigint
);


--
-- Name: annee_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.annee_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_param; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_param (
    id bigint NOT NULL,
    derniere_annee_creee integer
);


--
-- Name: automobile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automobile (
    id bigint NOT NULL
);


--
-- Name: automobile_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automobile_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: autre_immobilisation_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.autre_immobilisation_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    autres_machines_eur_duree_amortissement integer,
    autres_machines_eur_emission_reelle real,
    autres_machines_eur_is_emission_connue boolean,
    autres_machines_eur_nombre integer,
    autres_machines_eur_poids_du_produit real,
    autres_machines_kg_duree_amortissement integer,
    autres_machines_kg_emission_reelle real,
    autres_machines_kg_is_emission_connue boolean,
    autres_machines_kg_nombre integer,
    autres_machines_kg_poids_du_produit real,
    groupes_electrogenes_duree_amortissement integer,
    groupes_electrogenes_emission_reelle real,
    groupes_electrogenes_is_emission_connue boolean,
    groupes_electrogenes_nombre integer,
    groupes_electrogenes_poids_du_produit real,
    installation_complete_emission_de_ges real,
    installation_complete_is_emissiongesconnues boolean,
    moteur_electrique_duree_amortissement integer,
    moteur_electrique_emission_reelle real,
    moteur_electrique_is_emission_connue boolean,
    moteur_electrique_nombre integer,
    moteur_electrique_poids_du_produit real,
    onduleur_duree_de_vie integer,
    onduleur_emission_de_ges real,
    onduleur_is_emissiongesconnues boolean,
    onduleur_puissance_totale real,
    panneaux_duree_de_vie integer,
    panneaux_emission_de_ges real,
    panneaux_is_emissiongesconnues boolean,
    panneaux_puissance_totale real
);


--
-- Name: autre_mob_fr_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.autre_mob_fr_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    etudiant_distance_totale_autocar real,
    etudiant_distance_totale_avion real,
    etudiant_distance_totale_france_train_grandes_lignes real,
    etudiant_distance_totale_france_train_regional real,
    etudiant_distance_totale_voiture_electrique real,
    etudiant_distance_totale_voiture_thermique real,
    etudiant_nb_aller_simple_autocar real,
    etudiant_nb_aller_simple_avion real,
    etudiant_nb_aller_simple_france_train_grandes_lignes real,
    etudiant_nb_aller_simple_france_train_regional real,
    etudiant_nb_aller_simple_voiture_electrique real,
    etudiant_nb_aller_simple_voiture_thermique real,
    salarie_distance_totale_autocar real,
    salarie_distance_totale_avion real,
    salarie_distance_totale_france_train_grandes_lignes real,
    salarie_distance_totale_france_train_regional real,
    salarie_distance_totale_voiture_electrique real,
    salarie_distance_totale_voiture_thermique real,
    salarie_nb_aller_simple_autocar real,
    salarie_nb_aller_simple_avion real,
    salarie_nb_aller_simple_france_train_grandes_lignes real,
    salarie_nb_aller_simple_france_train_regional real,
    salarie_nb_aller_simple_voiture_electrique real,
    salarie_nb_aller_simple_voiture_thermique real
);


--
-- Name: batiment_existant_ou_neuf_construit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batiment_existant_ou_neuf_construit (
    id bigint NOT NULL,
    acv_batiment_realisee boolean,
    date_construction date,
    date_derniere_grosse_renovation date,
    emissions_ges_reellestco2 real,
    nom_ou_adresse character varying(255) NOT NULL,
    surface_enm2 real,
    valeur_enum_type_batiment integer,
    valeur_enum_type_structure integer
);


--
-- Name: batiment_existant_ou_neuf_construit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.batiment_existant_ou_neuf_construit ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.batiment_existant_ou_neuf_construit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: batiment_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batiment_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint
);


--
-- Name: batiment_onglet_associe_batiment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batiment_onglet_associe_batiment (
    batiment_onglet_id bigint NOT NULL,
    batiment_id bigint NOT NULL
);


--
-- Name: batiment_onglet_associe_entretien; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batiment_onglet_associe_entretien (
    batiment_onglet_id bigint NOT NULL,
    entretien_id bigint NOT NULL
);


--
-- Name: dechet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dechet (
    id bigint NOT NULL,
    quantite_tonne integer,
    valeur_enum_traitement integer
);


--
-- Name: dechet_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dechet_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    cartons_id bigint,
    metaux_id bigint,
    ordures_menageres_id bigint,
    textile_id bigint,
    verre_id bigint
);


--
-- Name: dechet_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dechet_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emission_fugitive_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emission_fugitive_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint
);


--
-- Name: energie_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.energie_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    conso_bois real,
    conso_eau real,
    conso_elec_chauffage real,
    conso_elec_specifique real,
    conso_fioul real,
    conso_gaz real,
    conso_reseau_ville real,
    valeur_enum_energie_reseau_ville integer,
    valeur_enum_energie_unite_bois integer,
    valeur_enum_energie_unite_fioul integer,
    valeur_enum_energie_unite_gaz integer
);


--
-- Name: entite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entite (
    id bigint NOT NULL,
    nom character varying(255),
    type character varying(255),
    notes_permanentes_id bigint
);


--
-- Name: entite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.entite ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.entite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: entretien_courant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entretien_courant (
    id bigint NOT NULL,
    date_ajout date,
    date_travaux date,
    duree_amortissement integer,
    nom_adresse character varying(255),
    surface_concernee real,
    valeur_enum_type_batiment integer,
    valeur_enum_type_travaux integer
);


--
-- Name: entretien_courant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.entretien_courant ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.entretien_courant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipement_numerique; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipement_numerique (
    id bigint NOT NULL,
    duree_amortissement integer,
    emissions_ges_precises_connues boolean,
    emissions_reelles_par_produit_kgco2e real,
    nombre integer,
    valeur_enum_equipement integer,
    equipement_numerique_id bigint
);


--
-- Name: equipement_numerique_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.equipement_numerique ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.equipement_numerique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: facteurs_emission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facteurs_emission (
    id bigint NOT NULL,
    categorie character varying(255),
    facteur_emission real,
    type character varying(255),
    unite character varying(255)
);


--
-- Name: facteurs_emission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.facteurs_emission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.facteurs_emission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: general_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.general_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    nb_etudiant integer,
    nb_salarie integer
);


--
-- Name: machine_emission_fugitive; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machine_emission_fugitive (
    id bigint NOT NULL,
    description_machine character varying(255),
    quantite_fluide_kg real,
    taux_de_fuite real,
    taux_de_fuite_connu boolean,
    valeur_enum_type_fluide integer,
    valeur_enum_type_machine integer,
    emission_fugitive_onglet_id bigint
);


--
-- Name: machine_emission_fugitive_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.machine_emission_fugitive ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.machine_emission_fugitive_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mob_international_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mob_international_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint
);


--
-- Name: mobilier_electromenager; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mobilier_electromenager (
    id bigint NOT NULL,
    date_ajout date,
    duree_amortissement integer,
    poids_du_produit real,
    quantite integer,
    valeur_enum_mobilier integer,
    batiment_onglet_id bigint
);


--
-- Name: mobilier_electromenager_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mobilier_electromenager ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mobilier_electromenager_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mobilite_domicile_travail_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mobilite_domicile_travail_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    bus_etudiant_km integer,
    bus_salarie_km integer,
    marcheapied_etudiant_km integer,
    marcheapied_salarie_km integer,
    metro_tramway_etudiant_km integer,
    metro_tramway_salarie_km integer,
    moto_etudiant_km integer,
    moto_salarie_km integer,
    nb_jours_deplacement_etudiant integer,
    nb_jours_deplacement_salarie integer,
    train_regional_etudiant_km integer,
    train_regional_salarie_km integer,
    trottinette_electrique_etudiant_km integer,
    trottinette_electrique_salarie_km integer,
    velo_electrique_etudiant_km integer,
    velo_electrique_salarie_km integer,
    velo_etudiant_km integer,
    velo_salarie_km integer,
    voiture_electrique_etudiant_km integer,
    voiture_electrique_salarie_km integer,
    voiture_hybride_etudiant_km integer,
    voiture_hybride_salarie_km integer,
    voiture_thermique_etudiant_km integer,
    voiture_thermique_salarie_km integer
);


--
-- Name: notes_permanentes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes_permanentes (
    id bigint NOT NULL,
    note_achat character varying(255),
    note_automobile character varying(255),
    note_autre_mobilite_fr character varying(255),
    note_batiment character varying(255),
    note_dechet character varying(255),
    note_energie character varying(255),
    note_energie_fugitive character varying(255),
    note_immobilisation character varying(255),
    note_mobilite_domicile_travail character varying(255),
    note_mobilite_internationale character varying(255),
    note_numerique character varying(255),
    note_parkings character varying(255)
);


--
-- Name: notes_permanentes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notes_permanentes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notes_permanentes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: numerique_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.numerique_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint,
    part_trafic_france_etranger real,
    trafic_cloud_utilisateur real,
    trafic_tip_utilisateur real,
    use_method_simplifiee boolean
);


--
-- Name: onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint
);


--
-- Name: onglet_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onglet_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_voirie; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_voirie (
    id bigint NOT NULL,
    date_ajout_en_base date,
    date_construction date,
    emissions_ges_connues boolean,
    emissions_ges_reelles real,
    nom_ou_adresse character varying(255),
    nombrem2 real,
    valeur_enum_type integer,
    valeur_enum_type_structure integer,
    parking_voirie_onglet_id bigint
);


--
-- Name: parking_voirie_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_voirie_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint
);


--
-- Name: parking_voirie_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_voirie_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_token (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    expires_at timestamp(6) with time zone NOT NULL,
    request_ip character varying(255),
    request_user_agent character varying(255),
    token_hash character varying(128) NOT NULL,
    used_at timestamp(6) with time zone,
    utilisateur_id bigint NOT NULL
);


--
-- Name: password_reset_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.password_reset_token ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.password_reset_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: trajectoire; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trajectoire (
    id bigint NOT NULL,
    lock_global boolean,
    reference_year integer NOT NULL,
    target_percentage real NOT NULL,
    target_year integer NOT NULL,
    entite_id bigint
);


--
-- Name: trajectoire_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.trajectoire ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.trajectoire_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: trajectoire_poste_reglage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trajectoire_poste_reglage (
    trajectoire_id bigint NOT NULL,
    reduction_pct integer,
    poste_id character varying(255) NOT NULL
);


--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateur (
    id bigint NOT NULL,
    email character varying(255),
    est_admin boolean,
    est_premiere_connexion boolean,
    est_super_admin boolean,
    mdp character varying(255),
    nom character varying(255),
    password_changed_at timestamp(6) with time zone,
    prenom character varying(255),
    role character varying(255),
    entite_id bigint
);


--
-- Name: utilisateur_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.utilisateur ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.utilisateur_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vehicule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicule (
    id bigint NOT NULL,
    date_ajout_en_base date,
    modele_ou_immatriculation character varying(255),
    nombre_kilometres_par_voiture_moyen real,
    nombre_vehicules_identiques integer,
    valeur_enum_type_vehicule integer,
    vehicule_onglet_id bigint
);


--
-- Name: vehicule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.vehicule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.vehicule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vehicule_onglet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicule_onglet (
    id bigint NOT NULL,
    est_termine boolean,
    note character varying(255),
    annee_id bigint
);


--
-- Name: voyage_mob_internationale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voyage_mob_internationale (
    id bigint NOT NULL,
    formation_continue_avion integer,
    formation_continue_train integer,
    pros_avion integer,
    pros_train integer,
    semestres_etudiants_avion integer,
    semestres_etudiants_train integer,
    stages_etudiants_avion integer,
    stages_etudiants_train integer,
    valeur_enum_mob_internationale_pays integer,
    voyage_mob_internationale_id bigint
);


--
-- Name: voyage_mob_internationale_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.voyage_mob_internationale ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.voyage_mob_internationale_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: achat_consommable achat_consommable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_consommable
    ADD CONSTRAINT achat_consommable_pkey PRIMARY KEY (id);


--
-- Name: achat_onglet achat_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT achat_onglet_pkey PRIMARY KEY (id);


--
-- Name: achat_restauration achat_restauration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_restauration
    ADD CONSTRAINT achat_restauration_pkey PRIMARY KEY (id);


--
-- Name: achat_textile achat_textile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_textile
    ADD CONSTRAINT achat_textile_pkey PRIMARY KEY (id);


--
-- Name: annee annee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annee
    ADD CONSTRAINT annee_pkey PRIMARY KEY (id);


--
-- Name: application_param application_param_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_param
    ADD CONSTRAINT application_param_pkey PRIMARY KEY (id);


--
-- Name: automobile automobile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automobile
    ADD CONSTRAINT automobile_pkey PRIMARY KEY (id);


--
-- Name: autre_immobilisation_onglet autre_immobilisation_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autre_immobilisation_onglet
    ADD CONSTRAINT autre_immobilisation_onglet_pkey PRIMARY KEY (id);


--
-- Name: autre_mob_fr_onglet autre_mob_fr_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autre_mob_fr_onglet
    ADD CONSTRAINT autre_mob_fr_onglet_pkey PRIMARY KEY (id);


--
-- Name: batiment_existant_ou_neuf_construit batiment_existant_ou_neuf_construit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_existant_ou_neuf_construit
    ADD CONSTRAINT batiment_existant_ou_neuf_construit_pkey PRIMARY KEY (id);


--
-- Name: batiment_onglet batiment_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_onglet
    ADD CONSTRAINT batiment_onglet_pkey PRIMARY KEY (id);


--
-- Name: dechet_onglet dechet_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT dechet_onglet_pkey PRIMARY KEY (id);


--
-- Name: dechet dechet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet
    ADD CONSTRAINT dechet_pkey PRIMARY KEY (id);


--
-- Name: emission_fugitive_onglet emission_fugitive_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emission_fugitive_onglet
    ADD CONSTRAINT emission_fugitive_onglet_pkey PRIMARY KEY (id);


--
-- Name: energie_onglet energie_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energie_onglet
    ADD CONSTRAINT energie_onglet_pkey PRIMARY KEY (id);


--
-- Name: entite entite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entite
    ADD CONSTRAINT entite_pkey PRIMARY KEY (id);


--
-- Name: entretien_courant entretien_courant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entretien_courant
    ADD CONSTRAINT entretien_courant_pkey PRIMARY KEY (id);


--
-- Name: equipement_numerique equipement_numerique_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipement_numerique
    ADD CONSTRAINT equipement_numerique_pkey PRIMARY KEY (id);


--
-- Name: facteurs_emission facteurs_emission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facteurs_emission
    ADD CONSTRAINT facteurs_emission_pkey PRIMARY KEY (id);


--
-- Name: general_onglet general_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.general_onglet
    ADD CONSTRAINT general_onglet_pkey PRIMARY KEY (id);


--
-- Name: machine_emission_fugitive machine_emission_fugitive_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_emission_fugitive
    ADD CONSTRAINT machine_emission_fugitive_pkey PRIMARY KEY (id);


--
-- Name: mob_international_onglet mob_international_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mob_international_onglet
    ADD CONSTRAINT mob_international_onglet_pkey PRIMARY KEY (id);


--
-- Name: mobilier_electromenager mobilier_electromenager_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobilier_electromenager
    ADD CONSTRAINT mobilier_electromenager_pkey PRIMARY KEY (id);


--
-- Name: mobilite_domicile_travail_onglet mobilite_domicile_travail_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobilite_domicile_travail_onglet
    ADD CONSTRAINT mobilite_domicile_travail_onglet_pkey PRIMARY KEY (id);


--
-- Name: notes_permanentes notes_permanentes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes_permanentes
    ADD CONSTRAINT notes_permanentes_pkey PRIMARY KEY (id);


--
-- Name: numerique_onglet numerique_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.numerique_onglet
    ADD CONSTRAINT numerique_onglet_pkey PRIMARY KEY (id);


--
-- Name: onglet onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onglet
    ADD CONSTRAINT onglet_pkey PRIMARY KEY (id);


--
-- Name: parking_voirie_onglet parking_voirie_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_voirie_onglet
    ADD CONSTRAINT parking_voirie_onglet_pkey PRIMARY KEY (id);


--
-- Name: parking_voirie parking_voirie_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_voirie
    ADD CONSTRAINT parking_voirie_pkey PRIMARY KEY (id);


--
-- Name: password_reset_token password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_pkey PRIMARY KEY (id);


--
-- Name: trajectoire trajectoire_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajectoire
    ADD CONSTRAINT trajectoire_pkey PRIMARY KEY (id);


--
-- Name: trajectoire_poste_reglage trajectoire_poste_reglage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajectoire_poste_reglage
    ADD CONSTRAINT trajectoire_poste_reglage_pkey PRIMARY KEY (trajectoire_id, poste_id);


--
-- Name: dechet_onglet uk1mmqlm7jtr0fgw79p4px9mucd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT uk1mmqlm7jtr0fgw79p4px9mucd UNIQUE (metaux_id);


--
-- Name: achat_onglet uke56eba59q2idxey5qlhtuvqk3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT uke56eba59q2idxey5qlhtuvqk3 UNIQUE (achat_restauration_id);


--
-- Name: dechet_onglet uklphk0wmaw8tnjv6690ob10pfk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT uklphk0wmaw8tnjv6690ob10pfk UNIQUE (ordures_menageres_id);


--
-- Name: dechet_onglet ukn63yi2yj21g4ctangs6ebv6l2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT ukn63yi2yj21g4ctangs6ebv6l2 UNIQUE (cartons_id);


--
-- Name: achat_onglet uknkq2u04dbsa2r74iibaanape4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT uknkq2u04dbsa2r74iibaanape4 UNIQUE (achat_consommable_id);


--
-- Name: dechet_onglet ukqv7pk0ujid8pigli2shq4lwqo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT ukqv7pk0ujid8pigli2shq4lwqo UNIQUE (verre_id);


--
-- Name: dechet_onglet ukra1l6povnk3ucwvs475v6xx72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT ukra1l6povnk3ucwvs475v6xx72 UNIQUE (textile_id);


--
-- Name: achat_onglet uks0w70u01e4ex60lv7radexr7u; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT uks0w70u01e4ex60lv7radexr7u UNIQUE (achat_textile_id);


--
-- Name: entite uksilijph5ly5q223h9om9dvuv4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entite
    ADD CONSTRAINT uksilijph5ly5q223h9om9dvuv4 UNIQUE (notes_permanentes_id);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);


--
-- Name: vehicule_onglet vehicule_onglet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicule_onglet
    ADD CONSTRAINT vehicule_onglet_pkey PRIMARY KEY (id);


--
-- Name: vehicule vehicule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicule
    ADD CONSTRAINT vehicule_pkey PRIMARY KEY (id);


--
-- Name: voyage_mob_internationale voyage_mob_internationale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voyage_mob_internationale
    ADD CONSTRAINT voyage_mob_internationale_pkey PRIMARY KEY (id);


--
-- Name: energie_onglet fk2gu4atskvpd8lilu9eka69htk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energie_onglet
    ADD CONSTRAINT fk2gu4atskvpd8lilu9eka69htk FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: voyage_mob_internationale fk327ddfra6j902i6p20nohq46d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voyage_mob_internationale
    ADD CONSTRAINT fk327ddfra6j902i6p20nohq46d FOREIGN KEY (voyage_mob_internationale_id) REFERENCES public.mob_international_onglet(id);


--
-- Name: dechet_onglet fk33i9h7vrkn4k7o958mg7wq14f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT fk33i9h7vrkn4k7o958mg7wq14f FOREIGN KEY (metaux_id) REFERENCES public.dechet(id);


--
-- Name: general_onglet fk37g3bfjhh5yulqjxfyh67dn61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.general_onglet
    ADD CONSTRAINT fk37g3bfjhh5yulqjxfyh67dn61 FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: numerique_onglet fk54qftsrbe5iinc2pprpw6ytdu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.numerique_onglet
    ADD CONSTRAINT fk54qftsrbe5iinc2pprpw6ytdu FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: batiment_onglet_associe_entretien fk5l1f3ffioolvxi8lba7fgwrjs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_onglet_associe_entretien
    ADD CONSTRAINT fk5l1f3ffioolvxi8lba7fgwrjs FOREIGN KEY (entretien_id) REFERENCES public.entretien_courant(id);


--
-- Name: dechet_onglet fk6xg2r4n1senc5d64u823pacf4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT fk6xg2r4n1senc5d64u823pacf4 FOREIGN KEY (textile_id) REFERENCES public.dechet(id);


--
-- Name: password_reset_token fk6xhhidrwocldvi9ifxkmynsdc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT fk6xhhidrwocldvi9ifxkmynsdc FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateur(id);


--
-- Name: equipement_numerique fk85ulhwp6xa3tgg2u602e4t2ua; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipement_numerique
    ADD CONSTRAINT fk85ulhwp6xa3tgg2u602e4t2ua FOREIGN KEY (equipement_numerique_id) REFERENCES public.numerique_onglet(id);


--
-- Name: mob_international_onglet fk8f3dys7mh930d0scc6we3mplm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mob_international_onglet
    ADD CONSTRAINT fk8f3dys7mh930d0scc6we3mplm FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: mobilite_domicile_travail_onglet fk8r5s6arcy0xsm9ajps5sl8q1r; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobilite_domicile_travail_onglet
    ADD CONSTRAINT fk8r5s6arcy0xsm9ajps5sl8q1r FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: achat_onglet fk9hc66ue8dmhwyoexqi8whc8r; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT fk9hc66ue8dmhwyoexqi8whc8r FOREIGN KEY (achat_restauration_id) REFERENCES public.achat_restauration(id);


--
-- Name: autre_immobilisation_onglet fkah2pcwm4v03c37gsbvk92x9p7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autre_immobilisation_onglet
    ADD CONSTRAINT fkah2pcwm4v03c37gsbvk92x9p7 FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: trajectoire_poste_reglage fkahwxjbn6cwirfmgihb9xyb1su; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajectoire_poste_reglage
    ADD CONSTRAINT fkahwxjbn6cwirfmgihb9xyb1su FOREIGN KEY (trajectoire_id) REFERENCES public.trajectoire(id);


--
-- Name: achat_onglet fkcu9rrof03x4f3krti036bwul7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT fkcu9rrof03x4f3krti036bwul7 FOREIGN KEY (achat_textile_id) REFERENCES public.achat_textile(id);


--
-- Name: batiment_onglet fkdcfsmgt7cx9svfc8l2drbjfcn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_onglet
    ADD CONSTRAINT fkdcfsmgt7cx9svfc8l2drbjfcn FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: machine_emission_fugitive fkdu3644d2hecva5n7tlmg6ahlo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_emission_fugitive
    ADD CONSTRAINT fkdu3644d2hecva5n7tlmg6ahlo FOREIGN KEY (emission_fugitive_onglet_id) REFERENCES public.emission_fugitive_onglet(id);


--
-- Name: parking_voirie_onglet fkf4pfvqvcqg0b60n7w1tknglc7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_voirie_onglet
    ADD CONSTRAINT fkf4pfvqvcqg0b60n7w1tknglc7 FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: entite fkfc1xe34h74o0ur3xlctbuov1k; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entite
    ADD CONSTRAINT fkfc1xe34h74o0ur3xlctbuov1k FOREIGN KEY (notes_permanentes_id) REFERENCES public.notes_permanentes(id);


--
-- Name: dechet_onglet fkfi5qcane7oxcs5ddqy1f6iu4y; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT fkfi5qcane7oxcs5ddqy1f6iu4y FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: trajectoire fkglgon282elt9kscify2pjmtik; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajectoire
    ADD CONSTRAINT fkglgon282elt9kscify2pjmtik FOREIGN KEY (entite_id) REFERENCES public.entite(id);


--
-- Name: annee fkgoym6emfmg42mm3c7mgpn1re8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annee
    ADD CONSTRAINT fkgoym6emfmg42mm3c7mgpn1re8 FOREIGN KEY (entite_id) REFERENCES public.entite(id);


--
-- Name: achat_onglet fkgyyfhjjt1knns4d39tkk3xcuv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT fkgyyfhjjt1knns4d39tkk3xcuv FOREIGN KEY (achat_consommable_id) REFERENCES public.achat_consommable(id);


--
-- Name: dechet_onglet fkheeffkfh3kkhfrpydg7sp2u82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT fkheeffkfh3kkhfrpydg7sp2u82 FOREIGN KEY (ordures_menageres_id) REFERENCES public.dechet(id);


--
-- Name: utilisateur fkjrf04hy5xyxd3x4j9462uk12a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT fkjrf04hy5xyxd3x4j9462uk12a FOREIGN KEY (entite_id) REFERENCES public.entite(id);


--
-- Name: dechet_onglet fkjw92xtvn6157lajnwewy0qh5m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT fkjw92xtvn6157lajnwewy0qh5m FOREIGN KEY (cartons_id) REFERENCES public.dechet(id);


--
-- Name: emission_fugitive_onglet fkk4w4m5yp4rvjul1lrdiqm4qpi; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emission_fugitive_onglet
    ADD CONSTRAINT fkk4w4m5yp4rvjul1lrdiqm4qpi FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: vehicule fkmn8886e113phfnhht8df01w0m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicule
    ADD CONSTRAINT fkmn8886e113phfnhht8df01w0m FOREIGN KEY (vehicule_onglet_id) REFERENCES public.vehicule_onglet(id);


--
-- Name: dechet_onglet fkmumq8cjokmbmfjqcu7rvfl2rt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dechet_onglet
    ADD CONSTRAINT fkmumq8cjokmbmfjqcu7rvfl2rt FOREIGN KEY (verre_id) REFERENCES public.dechet(id);


--
-- Name: mobilier_electromenager fkni9wmlej3qxt6dxu97xq7fbw5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobilier_electromenager
    ADD CONSTRAINT fkni9wmlej3qxt6dxu97xq7fbw5 FOREIGN KEY (batiment_onglet_id) REFERENCES public.batiment_onglet(id);


--
-- Name: batiment_onglet_associe_entretien fknleuukxwbu73piif63092uub3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_onglet_associe_entretien
    ADD CONSTRAINT fknleuukxwbu73piif63092uub3 FOREIGN KEY (batiment_onglet_id) REFERENCES public.batiment_onglet(id);


--
-- Name: parking_voirie fkof31d2c70prnt96ad8y0gmk8f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_voirie
    ADD CONSTRAINT fkof31d2c70prnt96ad8y0gmk8f FOREIGN KEY (parking_voirie_onglet_id) REFERENCES public.parking_voirie_onglet(id);


--
-- Name: autre_mob_fr_onglet fkpaip2rl0voc69wxvywel1bkbi; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autre_mob_fr_onglet
    ADD CONSTRAINT fkpaip2rl0voc69wxvywel1bkbi FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: onglet fkpck1plfkaenmg24gqlgnxu9fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onglet
    ADD CONSTRAINT fkpck1plfkaenmg24gqlgnxu9fe FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: achat_onglet fkq6iqghh38omxtisi8ynfhtwgk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achat_onglet
    ADD CONSTRAINT fkq6iqghh38omxtisi8ynfhtwgk FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- Name: batiment_onglet_associe_batiment fkrqcn2ekd98yiqmp9usqpui21v; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_onglet_associe_batiment
    ADD CONSTRAINT fkrqcn2ekd98yiqmp9usqpui21v FOREIGN KEY (batiment_id) REFERENCES public.batiment_existant_ou_neuf_construit(id);


--
-- Name: batiment_onglet_associe_batiment fkt3vp8xjwxoh0ci6bhps6ev7ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batiment_onglet_associe_batiment
    ADD CONSTRAINT fkt3vp8xjwxoh0ci6bhps6ev7ce FOREIGN KEY (batiment_onglet_id) REFERENCES public.batiment_onglet(id);


--
-- Name: vehicule_onglet fktdquuk0a6fep13jueghufsc3p; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicule_onglet
    ADD CONSTRAINT fktdquuk0a6fep13jueghufsc3p FOREIGN KEY (annee_id) REFERENCES public.annee(id);


--
-- PostgreSQL database dump complete
--


