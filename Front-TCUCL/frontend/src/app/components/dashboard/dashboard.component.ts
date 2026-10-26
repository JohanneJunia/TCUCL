import {Component, inject, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OngletStatusService } from '../../services/onglet-status.service';
import { OngletService } from '../header-saisie-donnees/onglet.service';
import { AnneeService } from '../../services/annee.service';
import { AuthService } from '../../services/auth.service';
import { ONGLET_KEYS } from '../../constants/onglet-keys';
import { MatIcon } from '@angular/material/icon';
import { BilanParSecteurComponent } from '../bilan-par-secteur/bilan-par-secteur.component';
import { SyntheseEgesService } from '../../services/synthese-eges.service';
import {UserService} from '../../services/user.service';


const extractRoute = (url: string): string =>
  url.split('/').slice(3).join('/').replace(/\/$/, '');

type YearRange = { label: string; value: number };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule, BilanParSecteurComponent]
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);

  isSuperAdmin = this.userService.isSuperAdmin;
  currentYear: number;
  selectedYear: number;
  years: YearRange[] = [];
  sectors: { label: string, value: number }[] = [];
  total = 0;
  establishmentName = '';
  selectedYearLabel = '';

  onglets = [
    { label: 'General', statusKey: ONGLET_KEYS.General, route: ONGLET_KEYS.General },
    { label: 'Energie', statusKey: ONGLET_KEYS.Energie, route: ONGLET_KEYS.Energie },
    { label: 'Emissions fugitives', statusKey: ONGLET_KEYS.EmissionsFugitives, route: ONGLET_KEYS.EmissionsFugitives },
    { label: 'Mobilité dom-trav', statusKey: ONGLET_KEYS.MobiliteDomTrav, route: ONGLET_KEYS.MobiliteDomTrav },
    { label: 'Autre mob fr', statusKey: ONGLET_KEYS.AutreMobFr, route: ONGLET_KEYS.AutreMobFr },
    { label: 'Mob internatio', statusKey: ONGLET_KEYS.MobInternationale, route: ONGLET_KEYS.MobInternationale },
    { label: 'Bâtiments', statusKey: ONGLET_KEYS.Batiments, route: ONGLET_KEYS.Batiments },
    { label: 'Parkings', statusKey: ONGLET_KEYS.Parkings, route: ONGLET_KEYS.Parkings },
    { label: 'Auto', statusKey: ONGLET_KEYS.Auto, route: ONGLET_KEYS.Auto },
    { label: 'Numérique', statusKey: ONGLET_KEYS.Numerique, route: ONGLET_KEYS.Numerique },
    { label: 'Autres immob', statusKey: ONGLET_KEYS.AutreImmob, route: ONGLET_KEYS.AutreImmob },
    { label: 'Achats', statusKey: ONGLET_KEYS.Achats, route: ONGLET_KEYS.Achats },
    { label: 'Déchets', statusKey: ONGLET_KEYS.Dechets, route: ONGLET_KEYS.Dechets }
  ];

  constructor(
    private router: Router,
    private statusService: OngletStatusService,
    private ongletService: OngletService,
    private yearService: AnneeService,
    private syntheseService: SyntheseEgesService,
    private auth: AuthService
  ) {
    this.currentYear = this.yearService.getCurrentAcademicYear();
    this.selectedYear = this.currentYear;
    const user = this.auth.getUserInfo()();
    if (user?.entiteId) {
      this.entiteId = user.entiteId;
    } else {
      console.error('Impossible de récupérer l’entiteId de l’utilisateur.');
    }
    this.establishmentName = (user?.entiteNom ?? '').trim();
  }
  @Input() entiteId!: number;
  ongletIdMap: { [key: string]: number } = {};
  statuses: Record<string, boolean> = {};

  ngOnInit(): void {
    this.fetchSectors();
    this.currentYear = this.yearService.getCurrentAcademicYear();
    this.years = Array.from({ length: this.currentYear - 2018 }, (_, i) => {
      const end = this.currentYear - i;
      const start = end - 1;
      return { label: `${start}-${end}`, value: end };
    });

    this.selectedYear = this.yearService.getSelectedYear();
    this.updateSelectedYearLabel();

    this.statusService.statuses$.subscribe((s: Record<string, boolean>) => {
      this.statuses = s;
    });
    this.ongletService
      .getStatutsParEntiteEtAnnee(this.entiteId, this.currentYear)?.subscribe({
        next: (result) => {
          this.statusService.setStatuses(result);
        },
        error: (err) => {
          console.error('Erreur récupération statuts:', err);
        }
      });
    this.loadOngletIds();
    this.loadOngletStatuses();
  }

  getStatus(key: string): boolean {
    return this.statuses[key] ?? false;
  }

  goToSaisie(onglet: { statusKey: string; route: string }): void {
    const id = this.ongletIdMap[onglet.statusKey];
    if (id) {
      this.router.navigate([`/${onglet.route}/${id}`]);
    } else {
      console.error('ID onglet introuvable pour', onglet.statusKey, 'année', this.selectedYear);
    }
  }

  goToGeneralOnglet(): void {
    const ongletId = this.ongletIdMap['generalOnglet'];
    if (ongletId) {
      this.router.navigate([`/generalOnglet/${ongletId}`]);
    } else {
      console.error('ID onglet général introuvable pour l\'année', this.selectedYear);
    }
  }

  onYearChange(newYear: number): void {
    this.selectedYear = newYear;
    this.yearService.setSelectedYear(newYear);
    this.updateSelectedYearLabel();
    this.loadOngletIds();
    this.loadOngletStatuses();
    this.fetchSectors();
  }

  private updateSelectedYearLabel(): void {
    const match = this.years.find((year) => year.value === this.selectedYear);
    if (match) {
      this.selectedYearLabel = match.label;
      return;
    }
    if (this.selectedYear) {
      this.selectedYearLabel = `${this.selectedYear - 1}-${this.selectedYear}`;
    } else {
      this.selectedYearLabel = '';
    }
  }

  get dashboardSubtitle(): string {
    const establishment = this.establishmentName.trim() || 'votre établissement';
    return `État d’avancement de la saisie des données de l'établissement ${establishment} sur l'année ${this.displayYearRange}`;
  }

  private get displayYearRange(): string {
    if (this.selectedYearLabel) {
      return this.selectedYearLabel;
    }
    if (this.selectedYear) {
      return `${this.selectedYear - 1}-${this.selectedYear}`;
    }
    const fallback = this.currentYear || new Date().getFullYear();
    return `${fallback - 1}-${fallback}`;
  }

  loadOngletIds(): void {
    this.ongletService.getOngletIds(this.entiteId, this.selectedYear)?.subscribe({
      next: (result) => {
        if (!result[ONGLET_KEYS.MobInternationale] && result['mobInternationalOnglet']) {
          result[ONGLET_KEYS.MobInternationale] = result['mobInternationalOnglet'];
          delete result['mobInternationalOnglet'];
        }
        this.ongletIdMap = result;
      },
      error: (err) => {
        console.error('Erreur récupération onglet IDs:', err);
      }
    });
  }

  fetchSectors(): void {
    const user = this.auth.getUserInfo()();
    const entiteId = user?.entiteId ?? user?.entiteID;
    const currentYear = this.selectedYear;

    if (!entiteId) return;

    this.syntheseService.getSynthese(entiteId, currentYear)?.subscribe({
      next: (res) => {
        const mapping: Record<string, number | null | undefined> = {
          'Emissions fugitives': res.emissionFugitivesGlobal,
          'Energie': res.energieGlobal,
          'Déplacements domicile - travail': res.mobiliteDomicileTravailGlobal,
          'Autres déplacements France': res.autreMobiliteFrGlobal,
          'Déplacements internationaux': res.mobiliteInternationalGlobal,
          'Bâtiments, mobilier et parkings': res.batimentParkingGlobal,
          'Numérique': res.numeriqueGlobal,
          'Autres immobilisations': res.autreImmobilisationGlobal,
          'Achats': res.achatGlobal,
          'Déchets': res.dechetGlobal
        };

        this.sectors = Object.entries(mapping).map(([label, value]) => {
          const num = Number(value);
          return {
            label,
            value: isNaN(num) ? 0 : num
            };
        });
        this.total = this.sectors.reduce((sum, s) => sum + s.value, 0);
      },
      error: err => console.error('Erreur fetchSectors:', err)
    });
  }


  loadOngletStatuses(): void {
    this.ongletService.getOngletStatuses(this.entiteId, this.selectedYear)?.subscribe({
      next: (result) => {
        if (!result[ONGLET_KEYS.MobInternationale] && result['mobInternationalOnglet']) {
          result[ONGLET_KEYS.MobInternationale] = result['mobInternationalOnglet'];
          delete result['mobInternationalOnglet'];
        }
        this.statuses = result;
        this.statusService.setStatuses(result);
      },
      error: (err) => {
        console.error('Erreur récupération statut onglets:', err);
      }
    });
  }
}
