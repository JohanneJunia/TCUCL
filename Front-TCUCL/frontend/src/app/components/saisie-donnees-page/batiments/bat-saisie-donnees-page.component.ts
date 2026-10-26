import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';
import { BatimentOngletMapperService } from './batiment-onglet-mapper.service';
import { BatimentsService } from './bat.service';
import { BatimentOngletModel, BatimentExistantOuNeufConstruit, EntretienCourant, MobilierElectromenager } from '../../../models/batiment.model';
import { OngletStatusService } from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';
import {
  EnumBatiment_TypeBatiment,
  EnumBatiment_TypeMobilier,
  EnumBatiment_TypeStructure,
  EnumBatiment_TypeTravaux
} from '../../../models/bat.enum';

@Component({
  selector: 'app-batiments-page',
  standalone: true,
  templateUrl: './bat-saisie-donnees-page.component.html',
  styleUrls: ['./bat-saisie-donnees-page.component.scss'],
  imports: [FormsModule, HttpClientModule, CommonModule, SaveFooterComponent]
})
export class BatimentsSaisieDonneesPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private mapper = inject(BatimentOngletMapperService);
  private statusService = inject(OngletStatusService);
  private batService = inject(BatimentsService);
  batimentOngletId: string = '';
  totalPosteBatiment!: number;
  totalPosteEntretien!: number;
  totalPosteMobilier!: number;

  get totalEmissions(): number {
    return (this.totalPosteBatiment || 0) + (this.totalPosteEntretien || 0) + (this.totalPosteMobilier || 0);
  }
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
  ]

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
    { value: EnumBatiment_TypeMobilier.REFRIGERATEUR, label: 'Réfrigirateur' },
    { value: EnumBatiment_TypeMobilier.AUTRE_MOBILIER_EN_EUROS, label: 'Autre mobilier en euros' },
    { value: EnumBatiment_TypeMobilier.AUTRE_MOBILIER_EN_TONNES, label: 'Autre mobilier en tonnes' }
  ];

  batimentOnglet: BatimentOngletModel = { batiments: [], entretiens: [], mobiliers: [] };


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



  batiments: any[]= [];
  // Parc immobilier (section 1)
  nouveauBatiment: any = {
    nom_ou_adresse: '',
    dateConstruction: null,
    dateDerniereGrosseRenovation: null,
    acvBatimentRealisee: null,
    emissionsGesReellesTCO2: null,
    typeBatiment: EnumBatiment_TypeBatiment.NA,
    surfaceEnM2: null,
    typeStructure: EnumBatiment_TypeStructure.NA,
  };


  // Entretien / rénovations (section 2)
  nouvelleReno: any = {
    dateAjout: '',
    nom_adresse: '',
    typeTravaux: EnumBatiment_TypeTravaux.CHAUFFAGE_VENTILATION_CLIMATISATION,
    dateTravaux: null,
    typeBatiment: EnumBatiment_TypeBatiment.NA,
    surfaceConcernee: null,
    dureeAmortissement: null
  };


  // Mobilier (section 3)
  nouveauMobilier: any = {
    dateAjout: '',
    mobilier: EnumBatiment_TypeMobilier.ARMOIRE,
    quantite: null,
    poidsDuProduit: null,
    dureeAmortissement: null
  };


  getDateAujourdhui(): string {
    const aujourdHui = new Date();
    const annee = aujourdHui.getFullYear();
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');
    const jour = String(aujourdHui.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
  }


  ngOnInit(): void {
    this.batimentOnglet.estTermine = this.statusService.getStatus(ONGLET_KEYS.Batiments);
    this.statusService.statuses$.subscribe(s => {
      this.batimentOnglet.estTermine = s[ONGLET_KEYS.Batiments] ?? false;
    });
    this.route.paramMap.subscribe(params => {
      this.batimentOngletId = params.get('id') || '';
      this.loadData();
      this.chargerResultatGES();
    });
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
      }
    });
  }

  ajouterBatiment(): void {
    const headers = this.getAuthHeaders();
    const batimentAAjouter = {
      ...this.nouveauBatiment,
      dateConstruction: this.nouveauBatiment.dateConstruction || null,
      dateDerniereGrosseRenovation: this.nouveauBatiment.dateDerniereGrosseRenovation || null,
      typeBatiment: this.nouveauBatiment.typeBatiment || null,
      typeStructure: this.nouveauBatiment.typeStructure || null
    };
    this.batService.ajouterBatiment(this.batimentOngletId, batimentAAjouter, headers).subscribe(() => {
      this.loadData();
      this.chargerResultatGES();
      this.resetFormBatiment();
    })
  }

  ajouterEntretien(): void {
    const entretienAAjouter = {
      ...this.nouvelleReno,
      dateAjout: this.getDateAujourdhui(),
      dateTravaux: this.nouvelleReno.dateTravaux || null,
      typeBatiment: this.nouvelleReno.typeBatiment || null,
      typeTravaux: this.nouvelleReno.typeTravaux || null
    };
    const headers = this.getAuthHeaders();
      this.batService
        .ajouterEntretien(this.batimentOngletId, entretienAAjouter, headers)
        .subscribe(() => {
          this.loadData();
          this.chargerResultatGES();
          this.resetFormRenovation();
        })
  }

  ajouterMobilier(): void {
    const mobilierAAjouter = {
      ...this.nouveauMobilier,
      dateAjout: this.getDateAujourdhui()
    };
    const headers = this.getAuthHeaders();
    this.batService
      .ajouterMobilier(this.batimentOngletId, mobilierAAjouter, headers)
      .subscribe(() => {
        this.loadData();
        this.chargerResultatGES();
        this.resetFormMobilier();
      });
  }

  supprimerBatiment(index: number): void {
    const headers = this.getAuthHeaders();
    const batiment = this.batimentOnglet.batiments[index];

    if (!batiment || !batiment.id) {
      // Si le bâtiment n'est pas encore enregistré en base
      this.batimentOnglet.batiments.splice(index, 1);
      return;
    }

    this.batService
      .supprimerBatiment(this.batimentOngletId, batiment.id, headers)
      .subscribe({
        next: () => {
          this.batimentOnglet.batiments.splice(index, 1);
          this.loadData();
          this.chargerResultatGES();
        },
        error: err => {
          console.error('Erreur lors de la suppression', err);
        }
      });
  }


  supprimerRenovation(index: number): void {
    const headers = this.getAuthHeaders();
    const renovation = this.batimentOnglet.entretiens[index];

    if (!renovation || !renovation.id) {
      // Si l'entretien n'est pas encore enregistré en base
      this.batimentOnglet.entretiens.splice(index, 1);
      return;
    }

    this.batService
      .supprimerEntretien(this.batimentOngletId, renovation.id, headers)
      .subscribe({
        next: () => {
          this.batimentOnglet.entretiens.splice(index, 1);
          this.loadData();
          this.chargerResultatGES();
        },
        error: err => {
          console.error('Erreur lors de la suppression', err);
        }
      });
  }

  supprimerMobilier(index: number): void {
    const headers = this.getAuthHeaders();
    const mobilier = this.batimentOnglet.mobiliers[index];

    if (mobilier && mobilier.id) {
      this.batService
        .supprimerMobilier(this.batimentOngletId, mobilier.id, headers)
        .subscribe({
          next: () => {
            this.batimentOnglet.mobiliers.splice(index, 1);
            this.loadData();
            this.chargerResultatGES();
          },
          error: err => {
            console.error('Erreur lors de la suppression', err);
          }
        });
    } else {
      // Si l'élément n'est pas encore persisté en base de données
      this.batimentOnglet.mobiliers.splice(index, 1);
    }
  }

  onEstTermineChange(value: boolean): void {
    this.batimentOnglet.estTermine = value;
    this.updateData();
  }

  updateData(): void {
    if (!this.batimentOngletId) return;
    const headers = this.getAuthHeaders();
    const payload = this.mapper.createPayloadFromModel(this.batimentOnglet);
    this.batService.updateOnglet(this.batimentOngletId, payload, headers).subscribe({
      error: err => console.error('Erreur mise à jour batiments', err)
    });
  }

  chargerResultatGES() {
    const headers = this.getAuthHeaders();
    this.batService.chargerResultatGES(this.batimentOngletId, headers).subscribe({
      next: (result) => {
        this.totalPosteBatiment = result.totalPosteBatiment;
        this.totalPosteEntretien = result.totalPosteEntretien;
        this.totalPosteMobilier = result.totalPosteMobilier;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des totaux GES', err);
      }
    });
  }

  resetFormBatiment() {
    this.nouveauBatiment = {
      nom_ou_adresse: '',
      dateConstruction: null,
      dateDerniereGrosseRenovation: null,
      acvBatimentRealisee: null,
      emissionsGesReellesTCO2: null,
      typeBatiment: EnumBatiment_TypeBatiment.NA,
      surfaceEnM2: null,
      typeStructure: EnumBatiment_TypeStructure.NA,
    }
  }
  resetFormRenovation() {
    this.nouvelleReno = {
      dateAjout: '',
      nom_adresse: '',
      typeTravaux: EnumBatiment_TypeTravaux.CHAUFFAGE_VENTILATION_CLIMATISATION,
      dateTravaux: null,
      typeBatiment: EnumBatiment_TypeBatiment.NA,
      surfaceConcernee: null,
      dureeAmortissement: null
    };
  }

  resetFormMobilier() {
    this.nouveauMobilier = {
      dateAjout: '',
      mobilier: EnumBatiment_TypeMobilier.ARMOIRE,
      quantite: null,
      poidsDuProduit: null,
      dureeAmortissement: null
    };
  }
}
