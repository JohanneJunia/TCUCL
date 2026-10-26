import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TYPE_DECHET, TRAITEMENT_DECHET } from '../../../models/enums/dechet.enum';
import { DechetData, DechetResultat } from '../../../models/dechet-data-model';
import { DechetDataMapperService } from './dechet-data-mapper.service';
import { ApiEndpoints } from '../../../services/api-endpoints';
import { AuthService } from '../../../services/auth.service';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';
import { OngletStatusService } from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';

@Component({
  selector: 'app-dechet-saisie-donnees-page',
  standalone: true,
  templateUrl: './dechets-saisie-donnees-page.component.html',
  styleUrls: ['./dechets-saisie-donnees-page.component.scss'],
  imports: [CommonModule, FormsModule, SaveFooterComponent],
})
export class DechetSaisieDonneesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private mapper = inject(DechetDataMapperService);
  private statusService = inject(OngletStatusService);

  items: DechetData[] = [];
  resultat: DechetResultat | null = null;

  estTermine = false;
  ONGLET_KEYS = ONGLET_KEYS;

  types = Object.values(TYPE_DECHET);
  traitements = Object.values(TRAITEMENT_DECHET);

  traitementsDisponibles: Record<TYPE_DECHET, TRAITEMENT_DECHET[]> = {
    [TYPE_DECHET.ORDURES_MENAGERES]: [TRAITEMENT_DECHET.INCINERATION],
    [TYPE_DECHET.CARTONS]: [TRAITEMENT_DECHET.RECYCLAGE, TRAITEMENT_DECHET.INCINERATION, TRAITEMENT_DECHET.STOCKAGE] as TRAITEMENT_DECHET[],
    [TYPE_DECHET.VERRE]: [TRAITEMENT_DECHET.RECYCLAGE, TRAITEMENT_DECHET.INCINERATION, TRAITEMENT_DECHET.STOCKAGE] as TRAITEMENT_DECHET[],
    [TYPE_DECHET.METAUX]: [TRAITEMENT_DECHET.RECYCLAGE, TRAITEMENT_DECHET.INCINERATION, TRAITEMENT_DECHET.STOCKAGE] as TRAITEMENT_DECHET[],
    [TYPE_DECHET.TEXTILE]: [TRAITEMENT_DECHET.RECYCLAGE],
  };

  typeLabels: Record<string, string> = {
    [TYPE_DECHET.ORDURES_MENAGERES]: 'Ordures ménagères',
    [TYPE_DECHET.CARTONS]: 'Cartons',
    [TYPE_DECHET.VERRE]: 'Verre',
    [TYPE_DECHET.METAUX]: 'Métaux',
    [TYPE_DECHET.TEXTILE]: 'Textile',
  };

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || type;
  }

  ngOnInit(): void {
    this.estTermine = this.statusService.getStatus(ONGLET_KEYS.Dechets);
    this.statusService.statuses$.subscribe((s: Record<string, boolean>) => {
      this.estTermine = s[ONGLET_KEYS.Dechets] ?? false;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
      this.loadResultat(id);
    }
  }

  loadData(id: string): void {
    const token = this.auth.getToken();
    if (!token) return;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    this.http.get<any>(ApiEndpoints.DechetsOnglet.getById(id), { headers }).subscribe({
      next: data => {
        this.items = this.mapper.parseData(data);
        this.estTermine = data.estTermine ?? false;
        this.statusService.setStatus(ONGLET_KEYS.Dechets, this.estTermine);
      },
      error: err => console.error('Erreur chargement déchets:', err),
    });
  }

  loadResultat(id: string): void {
    const token = this.auth.getToken();
    if (!token) return;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    this.http.get<DechetResultat>(ApiEndpoints.DechetsOnglet.resultat(id), { headers }).subscribe({
      next: data => {
        this.resultat = data;
      },
      error: err => console.error('Erreur chargement résultat déchets:', err),
    });
  }

  updateData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.auth.getToken();
    if (!id || !token) return;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const payload = { ...this.mapper.buildPayload(this.items), estTermine: this.estTermine };

    this.http.patch(ApiEndpoints.DechetsOnglet.update(id), payload, { headers }).subscribe({
      next: () => {
        this.loadResultat(id);
      },
      error: err => console.error('PATCH déchets échoué', err),
    });
  }

  onEstTermineChange(value: boolean): void {
    this.estTermine = value;
    this.updateData();
  }

  // ✅ Méthode pour corriger le bug Angular avec l'accès via string
  getTraitementsPour(type: string): TRAITEMENT_DECHET[] {
    return this.traitementsDisponibles[type as TYPE_DECHET] ?? [];
  }
}
