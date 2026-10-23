import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {SyntheseEgesService} from '../../../services/synthese-eges.service';
import {CommonModule, NgClass} from '@angular/common';

interface Indicator {
  label: string;
  value2019?: string | number;
  valueCurrent?: string | number;
  evolution?: string;
  section?: boolean;
}

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './trajectoire-page.component.html',
  styleUrls: ['./trajectoire-page.component.scss']
})
export class TrajectoireComponent implements OnInit {
  indicators: Indicator[] = [];
  currentYear: number = new Date().getFullYear();
  constructor(
    private router: Router,
    private auth: AuthService,
    private syntheseService: SyntheseEgesService
  ) {}

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToRecap() {
    this.router.navigate(['/synthese-eges']);
  }

  ngOnInit(): void {
    this.loadIndicators();
    this.fetchRealIndicators();
  }

  fetchRealIndicators(): void {
    const user = this.auth.getUserInfo()();
    const entiteId = user?.entiteId ?? user?.entiteID;
    if (!entiteId) return;

    this.syntheseService.getSynthese(entiteId, this.currentYear)?.subscribe({
      next: (synth) => {
        if (!synth) return;
        if (synth.consoEnergieFinale != null) {
          const val = Math.round(Number(synth.consoEnergieFinale));
          const row = this.indicators.find(i => i.label === 'Consommation d’énergie');
          if (row) {
            row.valueCurrent = val;
            row.evolution = this.getEvolution(3600, val);
          }
        }
        if (synth.intensiteCarboneParM2 != null) {
          const val = Number(Number(synth.intensiteCarboneParM2).toFixed(2));
          const row = this.indicators.find(i => i.label === 'Intensité carbone de l’énergie');
          if (row) {
            row.valueCurrent = val;
            row.evolution = this.getEvolution(177.02, val);
          }
        }
        if (synth.surfaceTotaleBatiments != null) {
          const row = this.indicators.find(i => i.label === 'Surface totale déclarée (m²)');
          if (row) {
            row.valueCurrent = Math.round(Number(synth.surfaceTotaleBatiments));
          }
        }
      },
      error: err => console.error('Erreur chargement synthèse pour indicateurs', err)
    });
  }

  loadIndicators(): void {
    this.indicators = [
      { label: 'ÉNERGIE ET BÂTIMENTS', section: true },
      { label: 'Surface totale déclarée (m²)', value2019: '-', valueCurrent: 0, evolution: '-' },
      { label: 'Consommation d’énergie', value2019: 3600, valueCurrent: 0, evolution: this.getEvolution(3600, 0) },
      { label: '  dont chauffage', value2019: 1500, valueCurrent: 0, evolution: this.getEvolution(1500, 0) },
      { label: '  dont électricité', value2019: 2100, valueCurrent: 0, evolution: this.getEvolution(2100, 0) },
      { label: 'Intensité carbone de l’énergie', value2019: 177.02, valueCurrent: 0, evolution: this.getEvolution(177.02, 0) },

      { label: 'DÉPLACEMENTS DOMICILE TRAVAIL', section: true },
      { label: 'Distance totale réalisée salarié', value2019: '2 694 930', valueCurrent: 0, evolution: this.getEvolution(2694930, 0) },
      { label: 'Part modale voiture', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: 'Part modale voiture électrique', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: 'Part modale modes doux', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: 'Distance totale réalisée étudiants', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: '  Part modale voiture', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: '  Part modale voiture électrique', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: '  Part modale modes doux', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: 'Intensité carbone des trajets', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },

      { label: 'DÉPLACEMENTS INTERNATIONAUX', section: true },
      { label: 'Distance totale', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: 'Intensité carbone des trajets', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },

      { label: 'IMMOBILISATIONS', section: true },
      { label: 'Nombre mobilier', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
      { label: 'Nombre d’équipements numériques', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },

      { label: 'DÉCHETS', section: true },
      { label: 'Quantité de déchets', value2019: 0, valueCurrent: 0, evolution: this.getEvolution(0, 0) },
    ];
  }

  getEvolution(value2019: number, valueCurrent: number): string {
    if (!value2019 || value2019 === 0) return '-';
    const evolution = ((valueCurrent - value2019) / value2019) * 100;
    const formatted = evolution.toFixed(0);
    return `${formatted}%`;
  }

  isGreen(evolution: string): boolean {
    return evolution.startsWith('-');
  }
}
