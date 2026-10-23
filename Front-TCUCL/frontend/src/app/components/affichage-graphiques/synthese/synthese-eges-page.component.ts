import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { SyntheseEgesService } from '../../../services/synthese-eges.service';

interface Sector {
  label: string;
  value: number;
}

interface ScopePoste {
  label: string;
  value: number;
}

@Component({
  selector: 'app-synthese-eges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './synthese-eges-page.component.html',
  styleUrls: ['./synthese-eges-page.component.scss']
})
export class SyntheseEgesComponent implements OnInit {
  sectors: Sector[] = [];
  total: number = 0;
  scopes: ScopePoste[] = [];
  scopesTotal: number = 0;
  private currentYear: number = new Date().getFullYear();
  private entiteId?: number;
  consoEnergieFinale?: number;
  surfaceTotaleBatiments?: number;
  consoEnergieFinaleParM2?: number;
  intensiteCarboneParM2?: number;
  bilanCarboneTotalParM2?: number;
  bilanCarboneTotalParUsager?: number;
  effectifTotal?: number;
  establishmentName = '';
  yearRangeLabel = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private syntheseService: SyntheseEgesService
  ) {
    const user = this.auth.getUserInfo()();
    if (user?.entiteId || user?.entiteID) {
      this.entiteId = user.entiteId ?? user.entiteID;
    }
    this.establishmentName = (user?.entiteNom ?? '').trim();
    this.yearRangeLabel = this.computeYearRange(this.currentYear);
  }

  ngOnInit(): void {
    this.loadSectors();
    this.loadScopes();
    this.fetchSynthese();
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToSuivi() {
    this.router.navigate(['/trajectoire']);
  }

  loadSectors(): void {
    this.sectors = [
      { label: 'Emissions fugitives', value: 0 },
      { label: 'Energie', value: 0 },
      { label: 'Déplacements domicile - travail', value: 0 },
      { label: 'Autres déplacements France', value: 0 },
      { label: 'Déplacements internationaux', value: 0 },
      { label: 'Bâtiments, mobilier et parkings', value: 0 },
      { label: 'Numérique', value: 0 },
      { label: 'Autres immobilisations', value: 0 },
      { label: 'Achats', value: 0 },
      { label: 'Déchets', value: 0 }
    ];
    this.total = this.sectors.reduce((sum, s) => sum + s.value, 0);
  }

  loadScopes(): void {
    this.scopes = [
      { label: 'Emissions directes des sources fixes de combustion', value: 0 },
      { label: 'Emissions directes des sources mobiles à moteur thermique', value: 0 },
      { label: 'Emissions directes des procédés hors énergie', value: 0 },
      { label: 'Emissions directes fugitives', value: 0 },
      { label: 'Emissions issues de la biomasse (sols et forêts)', value: 0 },
      { label: 'Emissions indirectes liées à la consommation d\'électricité', value: 0 },
      { label: 'Emissions indirectes liées à la consommation de vapeur, chaleur, froid', value: 0 },
      { label: 'Emissions liées à l\'énergie non incluse dans les catégories « émissions directes de GES » et « émissions de GES à énergie indirectes »', value: 0 },
      { label: 'Achats de produits ou services', value: 0 },
      { label: 'Immobilisations de biens', value: 0 },
      { label: 'Déchets', value: 0 },
      { label: 'Transport de marchandise amont', value: 0 },
      { label: 'Déplacements professionnels', value: 0 },
      { label: 'Actifs en leasing amont', value: 0 },
      { label: 'Investissements', value: 0 },
      { label: 'Transport de visiteurs et de clients', value: 0 },
      { label: 'Transport de marchandise aval', value: 0 },
      { label: 'Utilisation des produits vendus', value: 0 },
      { label: 'Fin de vie des produits vendus', value: 0 },
      { label: 'Franchise aval', value: 0 },
      { label: 'Leasing aval', value: 0 },
      { label: 'Déplacements domicile travail', value: 0 },
      { label: 'Autres émissions indirectes', value: 0 }
    ];
    this.scopesTotal = this.scopes.reduce((sum, s) => sum + s.value, 0);
  }

  private fetchSynthese(): void {
    if (!this.entiteId) {
      const user = this.auth.getUserInfo()();
      if (user?.entiteId || user?.entiteID) {
        this.entiteId = user.entiteId ?? user.entiteID;
      }
    }
    if (!this.entiteId) return;
    this.syntheseService
      .getSynthese(this.entiteId, this.currentYear)
      ?.subscribe({
        next: res => {
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

          this.sectors.forEach(s => {
            const val = mapping[s.label];
            if (val != null) {
              s.value = Number(val);
            }
          });

          const scopesMapping: Record<string, number | null | undefined> = {
            'Emissions directes des sources fixes de combustion': res.emissionDirecteCombustion,
            'Emissions directes des sources mobiles à moteur thermique': res.emissionDirecteMoteurThermique,
            'Emissions directes des procédés hors énergie': res.emissionDirecteHorsEnergie,
            'Emissions directes fugitives': res.emissionDirecteFugitives,
            'Emissions issues de la biomasse (sols et forêts)': res.emissionBiomasse,
            "Emissions indirectes liées à la consommation d'électricité": res.emissionIndirecteConsoElec,
            'Emissions indirectes liées à la consommation de vapeur, chaleur, froid': res.emissionIndirecteConsoVapeurChaleurFroid,
            "Emissions liées à l'énergie non incluse dans les catégories « émissions directes de GES » et « émissions de GES à énergie indirectes »": res.emissionNonIncluseDansDirectOuIndirecte,
            'Achats de produits ou services': res.achatProduitOuService,
            'Immobilisations de biens': res.immobilisationBien,
            'Déchets': res.dechet,
            'Transport de marchandise amont': res.transportMarchandiseAmont,
            'Déplacements professionnels': res.deplacementProfessionnel,
            'Actifs en leasing amont': res.leasingAmont,
            'Investissements': res.investissement,
            'Transport de visiteurs et de clients': res.transportVisiteursClients,
            'Transport de marchandise aval': res.transportMarchandiseAval,
            'Utilisation des produits vendus': res.utilisationProduitVendu,
            'Fin de vie des produits vendus': res.finVieProduitVendu,
            'Franchise aval': res.franchiseAval,
            'Leasing aval': res.leasingAval,
            'Déplacements domicile travail': res.deplacementDomicileTravail,
            'Autres émissions indirectes': res.autreEmissionIndirecte
          };

          this.scopes.forEach(sc => {
            const val = scopesMapping[sc.label];
            if (val != null) {
              sc.value = Number(val);
            }
          });

          this.total = Number(res.bilanCarboneTotalGlobal ?? 0);
          this.scopesTotal = Number(res.bilanCarboneTotalScope ?? 0);
          if (res.consoEnergieFinale != null) {
            this.consoEnergieFinale = res.consoEnergieFinale;
          }
          this.surfaceTotaleBatiments = res.surfaceTotaleBatiments != null ? Number(res.surfaceTotaleBatiments) : undefined;
          this.consoEnergieFinaleParM2 = res.consoEnergieFinaleParM2 != null ? Number(res.consoEnergieFinaleParM2) : undefined;
          this.intensiteCarboneParM2 = res.intensiteCarboneParM2 != null ? Number(res.intensiteCarboneParM2) : undefined;
          this.bilanCarboneTotalParM2 = res.bilanCarboneTotalParM2 != null ? Number(res.bilanCarboneTotalParM2) : undefined;
          this.bilanCarboneTotalParUsager = res.bilanCarboneTotalParUsager != null ? Number(res.bilanCarboneTotalParUsager) : undefined;
          this.effectifTotal = res.effectifTotal != null ? Number(res.effectifTotal) : undefined;
        },
        error: err => console.error('Erreur récupération synthèse', err)
      });
  }

  get bilanTitle(): string {
    const name = this.establishmentName || 'votre établissement';
    return `Bilan des émissions de gaz à effet de serre, par poste, pour l'établissement ${name} sur l'année ${this.displayYearRange}`;
  }

  private get displayYearRange(): string {
    return this.yearRangeLabel || this.computeYearRange(this.currentYear);
  }

  private computeYearRange(year: number): string {
    return `${year - 1}-${year}`;
  }
}
