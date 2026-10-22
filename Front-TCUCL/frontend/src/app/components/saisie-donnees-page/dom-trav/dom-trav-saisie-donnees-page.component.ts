import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../services/api-endpoints';
import {AuthService} from '../../../services/auth.service';
import {GROUPE_VOYAGEURS, MODE_TRANSPORT_DOM_TRAV} from '../../../models/enums/transport.enum';
import {TransportDomTrav} from '../../../models/transport-data.model';
import {TransportDataDomTravMapperService} from './transport-data-dom-trav-mapper.service';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';
import { OngletStatusService } from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';

@Component({
  selector: 'app-dom-trav-saisie-donnees-page',
  standalone: true,
  templateUrl: './dom-trav-saisie-donnees-page.component.html',
  styleUrls: ['./dom-trav-saisie-donnees-page.component.scss'],
  imports: [CommonModule, FormsModule, SaveFooterComponent],
})
export class DomTravSaisieDonneesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private mapper = inject(TransportDataDomTravMapperService);
  private statusService = inject(OngletStatusService);

  transportModes = Object.values(MODE_TRANSPORT_DOM_TRAV).filter(
    mode => mode !== MODE_TRANSPORT_DOM_TRAV.NOMBRE_TRAJETS
  );
  travelerGroups = Object.values(GROUPE_VOYAGEURS);

  items: TransportDomTrav[] = [];
  nbJoursEtudiant?: number;
  nbJoursSalarie?: number;

  estTermine = false;
  ONGLET_KEYS = ONGLET_KEYS;

  resultats?: {
    totalEtudiants?: number,
    totalSalaries?: number,
    distanceAnnuelleParUsagerSalaries?: number;
    distanceAnnuelleParUsagerEtudiants?: number;
    nombreDeJoursDeDeplacementSalaries?: number;
    nombreDeJoursDeDeplacementEtudiants?: number;
    distanceDomicileTravailMoyenneSalaries?: number;
    distanceDomicileTravailMoyenneEtudiants?: number;
    partModaleVoitureThermiqueSalaries?: number;
    partModaleVoitureThermiqueEtudiants?: number;
    partModaleVoitureElectriqueSalaries?: number;
    partModaleVoitureElectriqueEtudiants?: number;
    partModaleModesDouxSalaries?: number;
    partModaleModesDouxEtudiants?: number;
    intensiteCarboneMoyenSalaries?: number;
    intensiteCarboneMoyenEtudiants?: number;
  };

  get totalEmissions(): number {
    return (this.resultats?.totalEtudiants || 0) + (this.resultats?.totalSalaries || 0);
  }

  ngOnInit(): void {
    this.estTermine = this.statusService.getStatus(ONGLET_KEYS.MobiliteDomTrav);
    this.statusService.statuses$.subscribe(s => {
      this.estTermine = s[ONGLET_KEYS.MobiliteDomTrav] ?? false;
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadData(id);
    if(id) this.loadResultats(id);
  }

  loadData(id: string) {
    const token = this.authService.getToken();
    if (!token) {
      console.error("Token d'authentification manquant");
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    this.http.get<any>(ApiEndpoints.DomTravOnglet.getById(id), {headers}).subscribe({
      next: (data) => {
        this.items = this.mapper.parseFlatData(data);
        this.nbJoursEtudiant = data.nbJoursDeplacementEtudiant ?? 0;
        this.nbJoursSalarie = data.nbJoursDeplacementSalarie ?? 0;
        this.estTermine = data.estTermine ?? false;
        this.statusService.setStatus(ONGLET_KEYS.MobiliteDomTrav, this.estTermine);
      },
      error: (err) => console.error("Erreur lors du chargement des données", err)
    });
  }

  updateData() {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.authService.getToken();

    if (!id || !token) {
      console.error('ID ou token manquant');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const payload = {
      ...this.mapper.buildFlatPayload(this.items, this.nbJoursEtudiant, this.nbJoursSalarie),
      estTermine: this.estTermine
    };

    this.http.patch(ApiEndpoints.DomTravOnglet.update(id), payload, {headers}).subscribe({
      next: () => {
        this.loadResultats(id); // recharge les résultats après la mise à jour
      },
      error: (error) => console.error('Erreur lors de la mise à jour', error)
    });
  }

  getValue(mode: MODE_TRANSPORT_DOM_TRAV, group: GROUPE_VOYAGEURS): number {
    return this.items.find(i => i.transportMode === mode && i.travelerGroup === group)?.distanceKm ?? 0;
  }

  setValue(mode: MODE_TRANSPORT_DOM_TRAV, group: GROUPE_VOYAGEURS, value: number) {
    const entry = this.items.find(i => i.transportMode === mode && i.travelerGroup === group);
    if (entry) {
      entry.distanceKm = value;
    } else {
      this.items.push({
        transportMode: mode,
        travelerGroup: group,
        distanceKm: value
      });
    }
  }

  private tempValues = new Map<string, number>();

  onEstTermineChange(value: boolean): void {
    this.estTermine = value;
    this.updateData();
  }

  setValueTemp(mode: MODE_TRANSPORT_DOM_TRAV, group: GROUPE_VOYAGEURS, value: number) {
    const key = `${mode}_${group}`;
    this.tempValues.set(key, value);
  }

  applyValue(mode: MODE_TRANSPORT_DOM_TRAV, group: GROUPE_VOYAGEURS) {
    const key = `${mode}_${group}`;
    const value = this.tempValues.get(key);

    if (value !== undefined) {
      this.setValue(mode, group, value); // fait la mise à jour dans items[]
      this.updateData(); // déclenche le patch UNE SEULE FOIS ici
    }
  }

  loadResultats(id: string) {
    const token = this.authService.getToken();
    if (!token) {
      console.error("Token d'authentification manquant");
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    this.http.get(ApiEndpoints.DomTravOnglet.resultats(id), {headers}).subscribe({
      next: (data) => {
        this.resultats = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des résultats', err);
      }
    });
  }

  protected readonly MODE_TRANSPORT_DOM_TRAV = MODE_TRANSPORT_DOM_TRAV;
  protected readonly GROUPE_VOYAGEURS = GROUPE_VOYAGEURS;
}
