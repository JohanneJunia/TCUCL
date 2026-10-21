import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ApiEndpoints } from '../../../services/api-endpoints';
import { Pays } from '../../../models/enums/pays.enum';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';
import { OngletStatusService } from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';
import { MobInterOngletMapperService } from './mob-inter-onglet-mapper.service';
import { MobInternationalOngletModel, Voyage } from '../../../models/mob-international.model';

@Component({
  selector: 'app-destination-page',
  standalone: true,
  templateUrl: './mob-inter-saisie-donnees-page.component.html',
  styleUrls: ['./mob-inter-saisie-donnees-page.component.scss'],
  imports: [FormsModule, HttpClientModule, CommonModule, SaveFooterComponent]
})
export class MobiliteInternationaleSaisieDonneesPageComponent implements OnInit {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private statusService = inject(OngletStatusService);
  private mapper = inject(MobInterOngletMapperService);

  onglet: MobInternationalOngletModel = { voyages: [] };
  resultats: any = null;
  rajouter: boolean = false;
  selectedFile: File | null = null;

  get totalEmissions(): number {
    if (!this.resultats) return 0;
    const r = this.resultats;
    return (Number(r.emissionGesProEuropeTrain) || 0)
      + (Number(r.emissionGesProEuropeAvion) || 0)
      + (Number(r.emissionGesProHorsEurope) || 0)
      + (Number(r.emissionGesStagesEuropeTrain) || 0)
      + (Number(r.emissionGesStagesEuropeAvion) || 0)
      + (Number(r.emissionGesStagesHorsEurope) || 0)
      + (Number(r.emissionGesSemestresEtudiantsEuropeTrain) || 0)
      + (Number(r.emissionGesSemestresEtudiantsEuropeAvion) || 0)
      + (Number(r.emissionGesSemestresEtudiantsHorsEurope) || 0);
  }

  /**
   * Voyage saisi dans le formulaire. Tous les champs numériques sont
   * initialisés à 0 pour éviter l'envoi de valeurs null lors du PATCH.
   */
  nouveauVoyage: Voyage = {
    nomPays: '' as any,
    prosAvion: 0,
    prosTrain: 0,
    stagesEtudiantsAvion: 0,
    stagesEtudiantsTrain: 0,
    semestresEtudiantsAvion: 0,
    semestresEtudiantsTrain: 0
  };

  ONGLET_KEYS = ONGLET_KEYS;
  listePays = Object.values(Pays);

  ngOnInit(): void {
    this.onglet.estTermine = this.statusService.getStatus(ONGLET_KEYS.MobInternationale);

    this.statusService.statuses$.subscribe(s => {
      this.onglet.estTermine = s[ONGLET_KEYS.MobInternationale] ?? false;
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
      Authorization: `Bearer ${token}`
    };

    this.http.get<any>(ApiEndpoints.mobInternationaleOnglet.getById(id), { headers }).subscribe({
      next: data => {
        const model = this.mapper.fromDto(data);
        this.onglet.voyages = model.voyages;
        this.onglet.estTermine = model.estTermine ?? false;
        this.onglet.note = model.note;
        this.statusService.setStatus(ONGLET_KEYS.MobInternationale, this.onglet.estTermine ?? false);

      },
      error: err => console.error("Erreur lors du chargement des données", err)
    });
  }

  ajouterVoyage(): void {
    this.onglet.voyages.push({ ...this.nouveauVoyage });
    // Réinitialisation avec 0 pour garantir l'envoi d'entiers à l'API
    this.nouveauVoyage = {
      nomPays: '' as any,
      prosAvion: 0,
      prosTrain: 0,
      stagesEtudiantsAvion: 0,
      stagesEtudiantsTrain: 0,
      semestresEtudiantsAvion: 0,
      semestresEtudiantsTrain: 0
    };
    this.updateData();
  }

  rafraichirDonnees(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loadData(id);
    this.loadResultats(id);
  }

  supprimerVoyage(index: number): void {
    this.onglet.voyages.splice(index, 1);
    this.updateData();
  }

  onEstTermineChange(value: boolean): void {
    this.onglet.estTermine = value;
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

    const payload = this.mapper.toDto(this.onglet);

    this.http.patch(ApiEndpoints.mobInternationaleOnglet.update(id), payload, { headers }).subscribe({
      next: () => {
        this.loadResultats(id);
      },
      error: err => console.error('PATCH mobilite internationale echoue', err)
    });
  }

  loadResultats(ongletId: string): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error("Token d'authentification manquant");
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    this.http.get<any>(`${ApiEndpoints.mobInternationaleOnglet.resultats(ongletId)}`, { headers })
      .subscribe({
        next: data => {
          this.resultats = data;
        },
        error: err => {
          console.error('Erreur lors du chargement des résultats :', err);
        }
      });
  }

  triggerFileInput(rajouter: boolean) {
    this.rajouter = rajouter;
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    fileInput?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.importerFichier();
    }
  }

  importerFichier() {
    if (!this.selectedFile) return;

    const id = this.route.snapshot.paramMap.get('id');
    const token = this.authService.getToken();
    if (!token) {
      console.error("Token d'authentification manquant");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('rajouter', String(this.rajouter));

    this.http.post(ApiEndpoints.mobInternationaleOnglet.import(id), formData, {headers})
      .subscribe({
        next: () => {
          alert('Import réussi');
          // Recharge les données si nécessaire
        },
        error: () => {
          alert('Échec de l’import');
        }
      });
  }
}