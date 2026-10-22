import {Component, OnInit, inject} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {CommonModule} from '@angular/common';
import {SaveFooterComponent} from '../../save-footer/save-footer.component';
import {OngletStatusService} from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';
import {NumeriqueOngletMapperService} from './numerique-onglet-mapper.service';
import {NumeriqueService} from './numerique.service';
import {EquipementNumerique, NumeriqueModel} from '../../../models/numerique.model';
import {NumeriqueResultat} from '../../../models/numerique-resultat.model';
import {NUMERIQUE_EQUIPEMENT} from '../../../models/enums/numerique.enum';
import {numeriqueEquipmentLabels} from '../../../models/numerique-equipment-labels';

@Component({
  selector: 'app-numerique-saisie-donnees-page',
  standalone: true,
  templateUrl: './numerique-saisie-donnees-page.component.html',
  styleUrls: ['./numerique-saisie-donnees-page.component.scss'],
  imports: [FormsModule, HttpClientModule, CommonModule, SaveFooterComponent]
})
export class NumeriqueSaisieDonneesPageComponent implements OnInit {
  private numeriqueService = inject(NumeriqueService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private statusService = inject(OngletStatusService);
  private mapper = inject(NumeriqueOngletMapperService);

  donneesCloudDisponibles: boolean | null = null;
  traficCloud: number | null = null;
  tipUtilisateur: number | null = null;
  partTraficFranceEtranger: number | null = null;

  nouvelEquipement: EquipementNumerique = {
    equipement: NUMERIQUE_EQUIPEMENT.ECRAN,
    nombre: null,
    dureeAmortissement: null,
    emissionsGesPrecisesConnues: false,
    emissionsReellesParProduitKgCO2e: null
  };

  equipementOptions = Object.keys(NUMERIQUE_EQUIPEMENT).map(key => {
    const value = NUMERIQUE_EQUIPEMENT[key as keyof typeof NUMERIQUE_EQUIPEMENT];
    return {value, label: numeriqueEquipmentLabels[value]};
  });

  numeriqueEquipmentLabels = numeriqueEquipmentLabels;
  resultats: NumeriqueResultat | null = null;
  equipements: EquipementNumerique[] = [];
  estTermine = false;
  ONGLET_KEYS = ONGLET_KEYS;

  onEstTermineChange(value: boolean): void {
    this.estTermine = value;
    this.updateData();
  }

  ngOnInit(): void {
    this.estTermine = this.statusService.getStatus(ONGLET_KEYS.Numerique);
    this.statusService.statuses$.subscribe((statuses: Record<string, boolean>) => {
      this.estTermine = statuses[ONGLET_KEYS.Numerique] ?? false;
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
      this.loadResultats(id);
    }
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

    this.numeriqueService.getOnglet(id, headers).subscribe({
      next: data => {
        const model = this.mapper.fromDto(data);
        this.donneesCloudDisponibles = model.cloudDataDisponible;
        if (this.donneesCloudDisponibles === null && this.hasCloudData(model)) {
          this.donneesCloudDisponibles = true;
        }
        this.traficCloud = model.traficCloud;
        this.tipUtilisateur = model.tipUtilisateur;
        this.partTraficFranceEtranger = model.partTraficFranceEtranger;
        this.equipements = model.equipements;
        this.estTermine = model.estTermine ?? false;
        this.statusService.setStatus(ONGLET_KEYS.Numerique, this.estTermine);
      },
      error: err => console.error("Erreur lors du chargement des données numériques", err)
    });
  }
  onCloudOptionChange(disponible: boolean): void {
    this.donneesCloudDisponibles = disponible;
    if (!disponible) {
      this.traficCloud = 0;
      this.tipUtilisateur = 0;
      this.partTraficFranceEtranger = 0;
    }
    this.updateData();
  }

  ajouterEquipement(): void {
    if (
      this.nouvelEquipement.nombre !== null &&
      this.nouvelEquipement.dureeAmortissement !== null &&
      (!this.nouvelEquipement.emissionsGesPrecisesConnues ||
        this.nouvelEquipement.emissionsReellesParProduitKgCO2e !== null)
    ) {
      this.equipements.push({ ...this.nouvelEquipement });
      this.nouvelEquipement = {
        equipement: NUMERIQUE_EQUIPEMENT.ECRAN,
        nombre: null,
        dureeAmortissement: null,
        emissionsGesPrecisesConnues: false,
        emissionsReellesParProduitKgCO2e: null
      };
      this.updateData();
    }
  }

  updateData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.authService.getToken();
    if (!id || !token) {
      console.error('ID ou token manquant');
      return;
    }

    const ignoreCloudData = this.donneesCloudDisponibles === false;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const model: NumeriqueModel = {
      estTermine: this.estTermine,
      cloudDataDisponible: this.donneesCloudDisponibles,
      // Si l'utilisateur répond non, on force les valeurs cloud à 0 pour éviter qu'elles soient prises en compte
      traficCloud: ignoreCloudData ? 0 : this.traficCloud,
      tipUtilisateur: ignoreCloudData ? 0 : this.tipUtilisateur,
      partTraficFranceEtranger: ignoreCloudData ? 0 : this.partTraficFranceEtranger,
      equipements: this.equipements
    };

    const payload = this.mapper.toDto(model);
    this.numeriqueService.updateOnglet(id, payload, headers).subscribe({
      next: () => this.loadResultats(id),
      error: err => console.error('Erreur lors de la mise à jour des données numériques', err)
    });
  }

  private hasCloudData(model: NumeriqueModel): boolean {
    return [model.traficCloud, model.tipUtilisateur, model.partTraficFranceEtranger]
      .some(v => v !== null && v !== 0);
  }
  supprimerEquipement(index: number): void {
    this.equipements.splice(index, 1);
    this.updateData();
  }


  loadResultats(id: string) {
    const token = this.authService.getToken();
    if (!token) return;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
    this.numeriqueService.getResult(id, headers).subscribe({
      next: data => {
        this.resultats = data;
      },
      error: err => console.error('Erreur lors du chargement des résultats numériques', err)
    });
  }
}
