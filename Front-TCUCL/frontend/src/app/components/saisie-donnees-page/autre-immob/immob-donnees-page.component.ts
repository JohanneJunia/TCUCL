import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ApiEndpoints } from '../../../services/api-endpoints';
import { OngletStatusService } from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';
import { AutreImmobMapperService } from './autre-immob-mapper.service';

@Component({
  selector: 'app-saisie-donnees-page',
  standalone: true,
  templateUrl: './immob-donnees-page.component.html',
  styleUrls: ['./immob-donnees-page.component.scss'],
  imports: [FormsModule, HttpClientModule, CommonModule, SaveFooterComponent]
})
export class AutreImmobilisationPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private statusService = inject(OngletStatusService);
  private mapper = inject(AutreImmobMapperService);

  items: any = {
    // Photovoltaïque
    hasPanneaux: false,
    cablage: null,
    structure: null,

    // Installation PV
    pvInstallationPuissance: null,
    pvInstallationDuree: null,
    pvInstallationGESConnu: '',
    pvInstallationGESReel: null,

    // Panneaux
    pvPanneauxPuissance: null,
    pvPanneauxDuree: null,
    pvPanneauxGESConnu: '',
    pvPanneauxGESReel: null,

    // Onduleurs
    pvOnduleursPuissance: null,
    pvOnduleursDuree: null,
    pvOnduleursGESConnu: '',
    pvOnduleursGESReel: null,

    // Câblage / Structure
    pvCablagePuissance: null,
    pvCablageDuree: null,
    pvCablageGESConnu: '',
    pvCablageGESReel: null,

    // Machines
    machinesElectriques: false,
    machineType: '',
    machineNombre: null,
    machinePoids: null,
    machineAmortissement: null,
    machineGESConnu: '',
    machineGESReel: null,

    // Resultats
    totalPosteBatiment: null,
    totalPostePhotovoltaique: null,

    machines: []
  };

  estTermine = false;
  ONGLET_KEYS = ONGLET_KEYS;
  resultats: any = null;

  get totalEmissions(): number {
    const bat = Number(this.resultats?.totalPosteBatiment) || 0;
    const pv = Number(this.resultats?.totalPostePhotovoltaique) || 0;
    return bat + pv;
  }

  onEstTermineChange(value: boolean): void {
    this.estTermine = value;
    this.updateData();
  }

  ngOnInit() {
    this.estTermine = this.statusService.getStatus(ONGLET_KEYS.AutreImmob);
    this.statusService.statuses$.subscribe((s: Record<string, boolean>) => {
      this.estTermine = s[ONGLET_KEYS.AutreImmob] ?? false;
    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadData(id);
        this.loadResultats(id);
      }
    });
  }

  loadData(id: string): void {
    const token = this.authService.getToken();

    if (!token) {
      console.error("Token d'authentification manquant");
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    this.http.get<any>(ApiEndpoints.autreImmobilisationOnglet.getById(id), { headers }).subscribe({
      next: data => {
        const mapped = this.mapper.fromDto(data);
        this.items = { ...this.items, ...mapped };
        this.estTermine = mapped.estTermine ?? false;
        this.statusService.setStatus(ONGLET_KEYS.AutreImmob, this.estTermine);
      },
      error: err => console.error("Erreur lors du chargement des données", err)
    });
  }

  onGesConnuChange(connuKey: string, reelKey: string): void {
    const value = this.items[connuKey];
    if (value === false || value === 'false') {
      this.items[reelKey] = null;
    }
    this.updateData();
  }

  onMachineGesConnuChange(machine: any): void {
    if (machine.gesConnu === false || machine.gesConnu === 'false') {
      machine.gesReel = null;
    }
    this.updateData();
  }

  updateData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.authService.getToken();
    if (!id || !token) return;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    const payload = this.mapper.toDto({ ...this.items, estTermine: this.estTermine });
    this.http.patch(ApiEndpoints.autreImmobilisationOnglet.update(id), payload, { headers }).subscribe({
      next: () => {
        this.loadResultats(id);
      },
      error: err => console.error('PATCH immob echoue', err)
    });
  }

  loadResultats(id: string): void {
    const token = this.authService.getToken();

    if (!token) {
      console.error("Token d'authentification manquant");
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    this.http.get(ApiEndpoints.autreImmobilisationOnglet.resultat(id), { headers }).subscribe({
      next: res => {
        this.resultats = res;
      },
      error: err => {
        console.error("Erreur lors de la récupération des résultats", err);
      }
    });
  }

}
