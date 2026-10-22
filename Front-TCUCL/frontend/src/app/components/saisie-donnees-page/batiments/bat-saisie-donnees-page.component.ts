import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../services/auth.service';
import {AnneeService} from '../../../services/annee.service';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';
import { BatimentOngletMapperService } from './batiment-onglet-mapper.service';
import { BatimentsService } from './bat.service';
import { BatimentOngletModel, BatimentExistantOuNeufConstruit } from '../../../models/batiment.model';
import { BatimentResultat } from '../../../models/batiment-resultat.model';
import { OngletStatusService } from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';
import {
  EnumBatiment_TypeBatiment,
  EnumBatiment_TypeMobilier,
  EnumBatiment_TypeStructure,
  EnumBatiment_TypeTravaux
} from '../../../models/bat.enum';

/** Statut d'un bâtiment vis-à-vis du calcul (ticket 1). */
export interface StatutBatiment {
  code: 'compte' | 'exclu-age' | 'incomplet';
  libelle: string;
}

@Component({
  selector: 'app-batiments-page',
  standalone: true,
  templateUrl: './bat-saisie-donnees-page.component.html',
  styleUrls: ['./bat-saisie-donnees-page.component.scss'],
  imports: [FormsModule, HttpClientModule, CommonModule, SaveFooterComponent]
})
export class BatimentsSaisieDonneesPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private anneeService = inject(AnneeService);
  private mapper = inject(BatimentOngletMapperService);
  private statusService = inject(OngletStatusService);
  private batService = inject(BatimentsService);
  private subscriptions = new Subscription();

  /** Même valeur que DUREE_AMORTISSEMENT_BATIMENT côté backend. */
  readonly DUREE_AMORTISSEMENT_BATIMENT = 50;

  batimentOngletId: string = '';
  anneeBilan: number = this.anneeService.getSelectedYear();

  totalPosteBatiment: number | null = null;
  totalPosteEntretien: number | null = null;
  totalPosteMobilier: number | null = null;
  emissionsParBatiment: Record<number, number> = {};

  // Messages affichés sous chaque formulaire
  erreursBatiment: string[] = [];
  erreursEntretien: string[] = [];
  erreursMobilier: string[] = [];
  messageInfoBatiment = '';
  erreurServeur = '';

  ONGLET_KEYS = ONGLET_KEYS;
  batimentTypes = Object.values(EnumBatiment_TypeBatiment);
  structureTypes = Object.values(EnumBatiment_TypeStructure);
  travauxTypes = Object.values(EnumBatiment_TypeTravaux);
  batimentTypesLibelles = [
    { value: EnumBatiment_TypeBatiment.NA, label: 'Non renseigné' },
    { value: EnumBatiment_TypeBatiment.EQUIPEMENT_SPORTIF, label: 'Équipement sportif' },
    { value: EnumBatiment_TypeBatiment.LOGEMENT_COLLECTIF, label: 'Logement collectif' },
    { value: EnumBatiment_TypeBatiment.RESTAURATION, label: 'Restauration' },
    { value: EnumBatiment_TypeBatiment.ENSEIGNEMENT, label: 'Enseignement' },
    { value: EnumBatiment_TypeBatiment.HOPITAL, label: 'Hôpital' },
    { value: EnumBatiment_TypeBatiment.AUTRE, label: 'Autre' },
    { value: EnumBatiment_TypeBatiment.BUREAUX, label: 'Bureaux' }
  ];

  structureTypesLibelles = [
    { value: EnumBatiment_TypeStructure.NA, label: 'Non renseigné' },
    { value: EnumBatiment_TypeStructure.BETON, label: 'Béton' },
    { value: EnumBatiment_TypeStructure.BOIS, label: 'Bois' },
    { value: EnumBatiment_TypeStructure.MIXTE, label: 'Mixte' }
  ];

  travauxTypesLibelles = [
    { value: EnumBatiment_TypeTravaux.CHAUFFAGE_VENTILATION_CLIMATISATION, label:'Chauffage - Ventilation - Climatisation' },
    { value: EnumBatiment_TypeTravaux.CLOISONNEMENT_DOUBLAGE, label:'Cloisonnement - Doublage' },
    { value: EnumBatiment_TypeTravaux.FACADES_ET_MENUISERIES, label:'Facades - Menuiseries' },
    { value: EnumBatiment_TypeTravaux.SUPERSTRUCTURES_MACONNERIE, label:'Superstructures - Maçonnerie' },
    { value: EnumBatiment_TypeTravaux.SANITAIRES, label:'Sanitaires' },
    { value: EnumBatiment_TypeTravaux.VOIRIE, label:'Voirie' },
    { value: EnumBatiment_TypeTravaux.COUVERTURE_ETANCHEITE, label:'Couverture - Etanchéité' },
    { value: EnumBatiment_TypeTravaux.ELECTRICITE, label:'Electricité' },
    { value: EnumBatiment_TypeTravaux.REVETEMENTS_DE_SOLS_ET_MURS, label:'Revetements de sols et murs' },
    { value: EnumBatiment_TypeTravaux.FONDATIONS_INFRASTRUCTURES, label:'Fondations - Infrastructures' },
    { value: EnumBatiment_TypeTravaux.COMMUNICATION, label:'Communication' },
  ];

  mobilierTypesLibelles = [
    { value: EnumBatiment_TypeMobilier.ARMOIRE, label: 'Armoire' },
    { value: EnumBatiment_TypeMobilier.CANAPE, label: 'Canapé' },
    { value: EnumBatiment_TypeMobilier.CHAISES_BOIS, label: 'Chaises en bois' },
    { value: EnumBatiment_TypeMobilier.CHAISES_BOIS_TEXTILE, label: 'Chaises en bois et textile' },
    { value: EnumBatiment_TypeMobilier.CHAISES_PLASTIQUES, label: 'Chaises plastique' },
    { value: EnumBatiment_TypeMobilier.CHAISES_MOYENNE, label: 'Chaises moyenne' },
    { value: EnumBatiment_TypeMobilier.LIT, label: 'Lit' },
    { value: EnumBatiment_TypeMobilier.TABLE, label: 'Table' },
    { value: EnumBatiment_TypeMobilier.ASPIRATEUR_CLASSIQUE, label: 'Aspirateur classique' },
    { value: EnumBatiment_TypeMobilier.ASPIRATEUR_TRAINEAU_PRO, label: 'Aspirateur traineau-pro' },
    { value: EnumBatiment_TypeMobilier.CLIMATISEUR_MOBILE, label: 'Climatiseur mobile' },
    { value: EnumBatiment_TypeMobilier.CONGELATEUR_ARMOR, label: 'Congelateur armoire' },
    { value: EnumBatiment_TypeMobilier.CONGELATEUR_COFFRE, label: 'Congelateur coffre' },
    { value: EnumBatiment_TypeMobilier.LAVELINGE_7KG, label: 'Lave-linge 7kg' },
    { value: EnumBatiment_TypeMobilier.SECHE_LINGE_6KG, label: 'Sèche-linge 6kg' },
    { value: EnumBatiment_TypeMobilier.LAVE_VAISSELLE, label: 'Lave-vaisselle' },
    { value: EnumBatiment_TypeMobilier.MACHINE_A_CAFE_EXPRESSO, label: 'Machine à café expresso' },
    { value: EnumBatiment_TypeMobilier.MACHINE_A_CAFE_FILTRE, label: 'Machine à café filtre' },
    { value: EnumBatiment_TypeMobilier.MACHINE_A_CAFE_DOSETTES, label: 'Machine à café dosettes' },
    { value: EnumBatiment_TypeMobilier.MACHINE_A_CAFE_MOYENNE, label: 'Machine à café moyenne' },
    { value: EnumBatiment_TypeMobilier.BOUILLOIRE, label: 'Bouilloire' },
    { value: EnumBatiment_TypeMobilier.MICRO_ONDES, label: 'Micro-ondes' },
    { value: EnumBatiment_TypeMobilier.PLAQUES_DE_CUISSON, label: 'Plaques de cuisson' },
    { value: EnumBatiment_TypeMobilier.RADIATEUR_ELECTRIQUE, label: 'Radiateur électrique' },
    { value: EnumBatiment_TypeMobilier.REFRIGERATEUR, label: 'Réfrigérateur' },
    { value: EnumBatiment_TypeMobilier.AUTRE_MOBILIER_EN_EUROS, label: 'Autre mobilier en euros' },
    { value: EnumBatiment_TypeMobilier.AUTRE_MOBILIER_EN_TONNES, label: 'Autre mobilier en tonnes' }
  ];

  batimentOnglet: BatimentOngletModel = { batiments: [], entretiens: [], mobiliers: [] };

  // Parc immobilier (section 1)
  nouveauBatiment: any = this.batimentVide();

  // Entretien / rénovations (section 2)
  nouvelleReno: any = this.renovationVide();

  // Mobilier (section 3)
  nouveauMobilier: any = this.mobilierVide();

  // ===================================================================
  // Libellés
  // ===================================================================

  getLibelleTypeBatiment(type: string): string {
    const item = this.batimentTypesLibelles.find(t => t.value === type);
    return item ? item.label : type;
  }

  getLibelleTypeStructure(structure: string): string {
    const item = this.structureTypesLibelles.find(t => t.value === structure);
    return item ? item.label : structure;
  }

  getLibelleTypeTravaux(travaux: string): string {
    const item = this.travauxTypesLibelles.find(t => t.value === travaux);
    return item ? item.label : travaux;
  }

  getLibelleTypeMobilier(mobilier: string): string {
    const item = this.mobilierTypesLibelles.find(t => t.value === mobilier);
    return item ? item.label : mobilier;
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = this.authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  getDateAujourdhui(): string {
    const aujourdHui = new Date();
    const annee = aujourdHui.getFullYear();
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');
    const jour = String(aujourdHui.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
  }

  // ===================================================================
  // Cycle de vie
  // ===================================================================

  ngOnInit(): void {
    this.batimentOnglet.estTermine = this.statusService.getStatus(ONGLET_KEYS.Batiments);
    this.subscriptions.add(this.statusService.statuses$.subscribe(s => {
      this.batimentOnglet.estTermine = s[ONGLET_KEYS.Batiments] ?? false;
    }));
    this.subscriptions.add(this.anneeService.selectedYear$.subscribe(annee => {
      this.anneeBilan = annee;
    }));
    this.subscriptions.add(this.route.paramMap.subscribe(params => {
      this.batimentOngletId = params.get('id') || '';
      this.loadData();
      this.chargerResultatGES();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    const headers = this.getAuthHeaders();
    this.batService.getBatimentImmobilisationMobilier(this.batimentOngletId, headers).subscribe({
      next: (data) => {
        const model = this.mapper.parseDtoToModel(data);
        this.batimentOnglet = model;
        this.batimentOnglet.estTermine = model.estTermine ?? false;
        this.statusService.setStatus(ONGLET_KEYS.Batiments, this.batimentOnglet.estTermine);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.erreurServeur = 'Impossible de charger les données de l\'onglet. Rechargez la page.';
      }
    });
  }

  // ===================================================================
  // Validation (ticket 1)
  // ===================================================================

  private annee(date: string | null | undefined): number | null {
    if (!date) return null;
    const annee = Number(String(date).substring(0, 4));
    return Number.isFinite(annee) ? annee : null;
  }

  private estRenseigne(valeur: unknown): boolean {
    return valeur !== null && valeur !== undefined && valeur !== '';
  }

  private estPositif(valeur: unknown): boolean {
    return this.estRenseigne(valeur) && Number(valeur) > 0;
  }

  /**
   * Données sans lesquelles le backend ne peut pas calculer le bâtiment
   * (il le compte alors pour 0). Mêmes règles que emissionBatiment() côté Java.
   */
  champsCalculManquants(b: any): string[] {
    const manquants: string[] = [];
    if (b.acvBatimentRealisee === null || b.acvBatimentRealisee === undefined) {
      manquants.push('Indiquez si une ACV a été réalisée.');
      return manquants;
    }
    if (b.acvBatimentRealisee === true) {
      if (!this.estRenseigne(b.emissionsGesReellesTCO2) || Number(b.emissionsGesReellesTCO2) < 0) {
        manquants.push('Renseignez les émissions de GES issues de l\'ACV.');
      }
      return manquants;
    }
    if (this.annee(b.dateConstruction) === null) {
      manquants.push('La date de construction est obligatoire sans ACV.');
    }
    if (!b.typeBatiment || b.typeBatiment === EnumBatiment_TypeBatiment.NA) {
      manquants.push('Choisissez le type de bâtiment.');
    }
    if (!b.typeStructure || b.typeStructure === EnumBatiment_TypeStructure.NA) {
      manquants.push('Choisissez le type de structure.');
    }
    if (!this.estPositif(b.surfaceEnM2)) {
      manquants.push('La surface doit être supérieure à 0.');
    }
    return manquants;
  }

  validerBatiment(b: any): string[] {
    const erreurs: string[] = [];
    if (!b.nom_ou_adresse || !String(b.nom_ou_adresse).trim()) {
      erreurs.push('Le nom ou l\'adresse est obligatoire.');
    }
    const anneeCourante = new Date().getFullYear();
    const construction = this.annee(b.dateConstruction);
    const renovation = this.annee(b.dateDerniereGrosseRenovation);
    if (construction !== null && construction > anneeCourante) {
      erreurs.push('La date de construction ne peut pas être dans le futur.');
    }
    if (renovation !== null && renovation > anneeCourante) {
      erreurs.push('La date de rénovation ne peut pas être dans le futur.');
    }
    if (construction !== null && renovation !== null && renovation < construction) {
      erreurs.push('La date de rénovation ne peut pas précéder la date de construction.');
    }
    return [...erreurs, ...this.champsCalculManquants(b)];
  }

  validerEntretien(e: any): string[] {
    const erreurs: string[] = [];
    if (!e.nom_adresse || !String(e.nom_adresse).trim()) erreurs.push('Le nom du bâtiment est obligatoire.');
    if (!e.typeTravaux) erreurs.push('Choisissez le type de travaux.');
    if (this.annee(e.dateTravaux) === null) erreurs.push('La date des travaux est obligatoire.');
    if (!e.typeBatiment || e.typeBatiment === EnumBatiment_TypeBatiment.NA) erreurs.push('Choisissez le type de bâtiment.');
    if (!this.estPositif(e.surfaceConcernee)) erreurs.push('La surface doit être supérieure à 0.');
    if (!this.estPositif(e.dureeAmortissement)) erreurs.push('La durée d\'amortissement doit être supérieure à 0.');
    return erreurs;
  }

  validerMobilier(m: any): string[] {
    const erreurs: string[] = [];
    if (!m.mobilier) erreurs.push('Choisissez le type de mobilier.');
    if (!this.estPositif(m.quantite)) erreurs.push('Le nombre doit être supérieur à 0.');
    if (this.estRenseigne(m.poidsDuProduit) && Number(m.poidsDuProduit) < 0) erreurs.push('Le poids ne peut pas être négatif.');
    if (!this.estPositif(m.dureeAmortissement)) erreurs.push('La durée d\'amortissement doit être supérieure à 0.');
    return erreurs;
  }

  /** Le bâtiment est-il encore dans sa période d'amortissement pour l'année du bilan ? */
  private estDansPeriodeAmortissement(b: any): boolean {
    const seuil = this.anneeBilan - this.DUREE_AMORTISSEMENT_BATIMENT;
    const construction = this.annee(b.dateConstruction);
    const renovation = this.annee(b.dateDerniereGrosseRenovation);
    return (construction !== null && construction > seuil) || (renovation !== null && renovation > seuil);
  }

  statutBatiment(b: BatimentExistantOuNeufConstruit): StatutBatiment {
    if (this.champsCalculManquants(b).length > 0) {
      return { code: 'incomplet', libelle: 'Non compté : données incomplètes' };
    }
    if (b.acvBatimentRealisee !== true && !this.estDansPeriodeAmortissement(b)) {
      return { code: 'exclu-age', libelle: `Non compté : plus de ${this.DUREE_AMORTISSEMENT_BATIMENT} ans sans rénovation complète` };
    }
    return { code: 'compte', libelle: 'Compté' };
  }

  infobulleStatut(b: BatimentExistantOuNeufConstruit): string {
    const manquants = this.champsCalculManquants(b);
    return manquants.length > 0 ? manquants.join(' ') : '';
  }

  emissionBatiment(b: BatimentExistantOuNeufConstruit): number | null {
    if (b.id === undefined || b.id === null) return null;
    const valeur = this.emissionsParBatiment[b.id];
    return valeur === undefined ? null : valeur;
  }

  // ===================================================================
  // Ajouts
  // ===================================================================

  ajouterBatiment(): void {
    this.erreurServeur = '';
    this.messageInfoBatiment = '';
    this.erreursBatiment = this.validerBatiment(this.nouveauBatiment);
    if (this.erreursBatiment.length > 0) return;

    const batimentAAjouter = {
      ...this.nouveauBatiment,
      dateConstruction: this.nouveauBatiment.dateConstruction || null,
      dateDerniereGrosseRenovation: this.nouveauBatiment.dateDerniereGrosseRenovation || null,
      typeBatiment: this.nouveauBatiment.typeBatiment || null,
      typeStructure: this.nouveauBatiment.typeStructure || null
    };
    const horsPeriode = batimentAAjouter.acvBatimentRealisee !== true
      && !this.estDansPeriodeAmortissement(batimentAAjouter);

    this.batService.ajouterBatiment(this.batimentOngletId, batimentAAjouter, this.getAuthHeaders()).subscribe({
      next: () => {
        if (horsPeriode) {
          this.messageInfoBatiment = `Bâtiment enregistré, mais il n'est pas compté pour ${this.anneeBilan} : `
            + `il a plus de ${this.DUREE_AMORTISSEMENT_BATIMENT} ans et n'a pas de rénovation complète récente.`;
        }
        this.loadData();
        this.chargerResultatGES();
        this.resetFormBatiment();
      },
      error: err => {
        console.error('Erreur lors de l\'ajout du bâtiment', err);
        this.erreurServeur = 'L\'enregistrement du bâtiment a échoué. Vérifiez les champs puis réessayez.';
      }
    });
  }

  ajouterEntretien(): void {
    this.erreurServeur = '';
    this.erreursEntretien = this.validerEntretien(this.nouvelleReno);
    if (this.erreursEntretien.length > 0) return;

    const entretienAAjouter = {
      ...this.nouvelleReno,
      dateAjout: this.getDateAujourdhui(),
      dateTravaux: this.nouvelleReno.dateTravaux || null,
      typeBatiment: this.nouvelleReno.typeBatiment || null,
      typeTravaux: this.nouvelleReno.typeTravaux || null
    };
    this.batService.ajouterEntretien(this.batimentOngletId, entretienAAjouter, this.getAuthHeaders()).subscribe({
      next: () => {
        this.loadData();
        this.chargerResultatGES();
        this.resetFormRenovation();
      },
      error: err => {
        console.error('Erreur lors de l\'ajout de la rénovation', err);
        this.erreurServeur = 'L\'enregistrement de la rénovation a échoué. Vérifiez les champs puis réessayez.';
      }
    });
  }

  ajouterMobilier(): void {
    this.erreurServeur = '';
    this.erreursMobilier = this.validerMobilier(this.nouveauMobilier);
    if (this.erreursMobilier.length > 0) return;

    const mobilierAAjouter = {
      ...this.nouveauMobilier,
      dateAjout: this.getDateAujourdhui()
    };
    this.batService.ajouterMobilier(this.batimentOngletId, mobilierAAjouter, this.getAuthHeaders()).subscribe({
      next: () => {
        this.loadData();
        this.chargerResultatGES();
        this.resetFormMobilier();
      },
      error: err => {
        console.error('Erreur lors de l\'ajout du mobilier', err);
        this.erreurServeur = 'L\'enregistrement du mobilier a échoué. Vérifiez les champs puis réessayez.';
      }
    });
  }

  // ===================================================================
  // Suppressions
  // ===================================================================

  supprimerBatiment(index: number): void {
    const batiment = this.batimentOnglet.batiments[index];

    if (!batiment || !batiment.id) {
      this.batimentOnglet.batiments.splice(index, 1);
      return;
    }

    this.batService.supprimerBatiment(this.batimentOngletId, batiment.id, this.getAuthHeaders()).subscribe({
      next: () => {
        this.batimentOnglet.batiments.splice(index, 1);
        this.loadData();
        this.chargerResultatGES();
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
        this.erreurServeur = 'La suppression du bâtiment a échoué.';
      }
    });
  }

  supprimerRenovation(index: number): void {
    const renovation = this.batimentOnglet.entretiens[index];

    if (!renovation || !renovation.id) {
      this.batimentOnglet.entretiens.splice(index, 1);
      return;
    }

    this.batService.supprimerEntretien(this.batimentOngletId, renovation.id, this.getAuthHeaders()).subscribe({
      next: () => {
        this.batimentOnglet.entretiens.splice(index, 1);
        this.loadData();
        this.chargerResultatGES();
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
        this.erreurServeur = 'La suppression de la rénovation a échoué.';
      }
    });
  }

  supprimerMobilier(index: number): void {
    const mobilier = this.batimentOnglet.mobiliers[index];

    if (!mobilier || !mobilier.id) {
      this.batimentOnglet.mobiliers.splice(index, 1);
      return;
    }

    this.batService.supprimerMobilier(this.batimentOngletId, mobilier.id, this.getAuthHeaders()).subscribe({
      next: () => {
        this.batimentOnglet.mobiliers.splice(index, 1);
        this.loadData();
        this.chargerResultatGES();
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
        this.erreurServeur = 'La suppression du mobilier a échoué.';
      }
    });
  }

  // ===================================================================
  // Statut et résultats
  // ===================================================================

  onEstTermineChange(value: boolean): void {
    this.batimentOnglet.estTermine = value;
    this.updateData();
  }

  updateData(): void {
    if (!this.batimentOngletId) return;
    const payload = this.mapper.createPayloadFromModel(this.batimentOnglet);
    this.batService.updateOnglet(this.batimentOngletId, payload, this.getAuthHeaders()).subscribe({
      error: err => console.error('Erreur mise à jour batiments', err)
    });
  }

  chargerResultatGES(): void {
    this.batService.chargerResultatGES(this.batimentOngletId, this.getAuthHeaders()).subscribe({
      next: (result: BatimentResultat) => {
        this.totalPosteBatiment = result.totalPosteBatiment;
        this.totalPosteEntretien = result.totalPosteEntretien;
        this.totalPosteMobilier = result.totalPosteMobilier;
        this.emissionsParBatiment = result.emissionGESBatimentExistantOuNeufConstruit ?? {};
      },
      error: (err) => {
        console.error('Erreur lors du chargement des totaux GES', err);
        this.erreurServeur = 'Le calcul des émissions n\'a pas pu être chargé.';
      }
    });
  }

  // ===================================================================
  // Réinitialisation des formulaires
  // ===================================================================

  private batimentVide(): any {
    return {
      nom_ou_adresse: '',
      dateConstruction: null,
      dateDerniereGrosseRenovation: null,
      acvBatimentRealisee: null,
      emissionsGesReellesTCO2: null,
      typeBatiment: EnumBatiment_TypeBatiment.NA,
      surfaceEnM2: null,
      typeStructure: EnumBatiment_TypeStructure.NA,
    };
  }

  private renovationVide(): any {
    return {
      dateAjout: '',
      nom_adresse: '',
      typeTravaux: EnumBatiment_TypeTravaux.CHAUFFAGE_VENTILATION_CLIMATISATION,
      dateTravaux: null,
      typeBatiment: EnumBatiment_TypeBatiment.NA,
      surfaceConcernee: null,
      dureeAmortissement: null
    };
  }

  private mobilierVide(): any {
    return {
      dateAjout: '',
      mobilier: EnumBatiment_TypeMobilier.ARMOIRE,
      quantite: null,
      poidsDuProduit: null,
      dureeAmortissement: null
    };
  }

  resetFormBatiment(): void {
    this.nouveauBatiment = this.batimentVide();
    this.erreursBatiment = [];
  }

  resetFormRenovation(): void {
    this.nouvelleReno = this.renovationVide();
    this.erreursEntretien = [];
  }

  resetFormMobilier(): void {
    this.nouveauMobilier = this.mobilierVide();
    this.erreursMobilier = [];
  }
}
