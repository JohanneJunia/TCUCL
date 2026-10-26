import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {ApiEndpoints} from '../../../services/api-endpoints';
import {OngletStatusService} from '../../../services/onglet-status.service';
import { ONGLET_KEYS } from '../../../constants/onglet-keys';
import { SaveFooterComponent } from '../../save-footer/save-footer.component';

/** Champs de consommation saisis dans l'onglet Énergie. */
export type ChampConso =
  | 'consoGaz' | 'consoFioul' | 'consoBois' | 'consoReseauVille'
  | 'consoElecChauffage' | 'consoElecSpecifique' | 'consoEau';

type ChampUnite = 'uniteGaz' | 'uniteFioul' | 'uniteBois';

interface LigneConso {
  champ: ChampConso;
  libelle: string;
  champUnite?: ChampUnite;                       // présent si l'unité est choisie par l'utilisateur
  unites?: { valeur: string; libelle: string }[];
  uniteFixe?: string;                            // sinon, unité affichée telle quelle
}

/** Nombre maximal de décimales conservées et affichées. */
const DECIMALES_MAX = 3;

@Component({
  selector: 'app-saisie-donnees-page',
  standalone: true,
  templateUrl: './energie-saisie-donnees-page.component.html',
  styleUrls: ['./energie-saisie-donnees-page.component.scss'],
  imports: [CommonModule, FormsModule, SaveFooterComponent]
})
export class EnergieSaisieDonneesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private statusService = inject(OngletStatusService);

  items: any = {};
  estTermine = false;
  ONGLET_KEYS = ONGLET_KEYS;
  resultats: any = {};

  /** Texte affiché dans chaque champ (formaté hors saisie, brut pendant la saisie). */
  affichage: Record<string, string> = {};
  /** Message d'erreur par champ (saisie non numérique ou négative). */
  erreurs: Record<string, string> = {};

  /**
   * Unités proposées. Le gaz n'a pas d'unité « Tonnes » : elle n'existe ni dans
   * l'énumération du backend (erreur 400, ticket 26 / S4) ni dans les facteurs d'émission.
   */
  readonly lignes: LigneConso[] = [
    { champ: 'consoGaz', libelle: 'Gaz', champUnite: 'uniteGaz', unites: [
        { valeur: 'MWH_PCS', libelle: 'MWh PCS' }, { valeur: 'M3', libelle: 'm³' }] },
    { champ: 'consoFioul', libelle: 'Fioul', champUnite: 'uniteFioul', unites: [
        { valeur: 'TONNE', libelle: 'Tonnes' }, { valeur: 'MWH_PCS', libelle: 'MWh PCS' }, { valeur: 'M3', libelle: 'm³' }] },
    { champ: 'consoBois', libelle: 'Bois', champUnite: 'uniteBois', unites: [
        { valeur: 'TONNE', libelle: 'Tonnes' }, { valeur: 'MWH_PCS', libelle: 'MWh PCS' }] },
    { champ: 'consoReseauVille', libelle: 'Réseau de chaleur urbain', uniteFixe: 'MWh PCS' },
    { champ: 'consoElecChauffage', libelle: 'Électricité pour le chauffage', uniteFixe: 'MWh PCS' },
    { champ: 'consoElecSpecifique', libelle: 'Électricité spécifique', uniteFixe: 'MWh PCS' },
    { champ: 'consoEau', libelle: 'Eau', uniteFixe: 'm³' },
  ];

  onEstTermineChange(value: boolean): void {
    this.estTermine = value;
    this.updateConso();
  }

  ngOnInit() {
    this.estTermine = this.statusService.getStatus(ONGLET_KEYS.Energie);
    this.statusService.statuses$.subscribe((statuses: Record<string, boolean>) => {
      this.estTermine = statuses[ONGLET_KEYS.Energie] ?? false;
    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadData(id);
        this.loadResultats(id);
      }
    });
  }

  private headers(): Record<string, string> | null {
    const token = this.authService.getToken();
    if (!token) {
      console.error("Token d'authentification manquant");
      return null;
    }
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  }

  loadData(id: string) {
    const headers = this.headers();
    if (!headers) return;

    this.http.get<any>(ApiEndpoints.EnergieOnglet.getById(id), {headers}).subscribe({
      next: (data) => {
        this.items = {
          consoGaz: data.consoGaz,
          uniteGaz: data.uniteGaz,
          consoFioul: data.consoFioul,
          uniteFioul: data.uniteFioul,
          consoBois: data.consoBois,
          uniteBois: data.uniteBois,
          consoReseauVille: data.consoReseauVille,
          consoElecChauffage: data.consoElecChauffage,
          consoElecSpecifique: data.consoElecSpecifique,
          consoEau: data.consoEau
        };
        this.lignes.forEach(l => (this.affichage[l.champ] = this.formatNumber(this.items[l.champ])));
        this.estTermine = data.estTermine ?? false;
        this.statusService.setStatus(ONGLET_KEYS.Energie, this.estTermine);
      },
      error: (error) => console.error("Erreur lors du chargement des données", error)
    });
  }

  // ===================================================================
  // Saisie : texte libre pendant la frappe, conversion à la sortie du champ
  // ===================================================================

  /** À l'entrée dans le champ : afficher la valeur sans séparateur de milliers, pour l'éditer. */
  onFocus(champ: ChampConso): void {
    const valeur = this.items[champ];
    this.affichage[champ] = valeur === null || valeur === undefined ? '' : String(valeur).replace('.', ',');
  }

  /** À la sortie du champ : convertir, valider, reformater et enregistrer. */
  onBlur(champ: ChampConso): void {
    const saisie = this.affichage[champ] ?? '';
    const valeur = this.parseNumber(saisie);

    if (valeur === null) {
      this.erreurs[champ] = 'Saisissez un nombre (exemple : 1 234,5).';
      return;
    }
    if (valeur < 0) {
      this.erreurs[champ] = 'La consommation ne peut pas être négative.';
      return;
    }

    delete this.erreurs[champ];
    const aChange = valeur !== (this.items[champ] ?? 0);
    this.items[champ] = valeur;
    this.affichage[champ] = this.formatNumber(valeur);
    if (aChange) this.updateConso();
  }

  updateConso() {
    const id = this.route.snapshot.paramMap.get('id');
    const headers = this.headers();
    if (!id || !headers) {
      console.error('ID ou Token manquant');
      return;
    }

    this.http.patch<any>(
      ApiEndpoints.EnergieOnglet.updateConso(id),
      {
        consoGaz: this.items.consoGaz,
        uniteGaz: this.items.uniteGaz,
        consoFioul: this.items.consoFioul,
        uniteFioul: this.items.uniteFioul,
        consoBois: this.items.consoBois,
        uniteBois: this.items.uniteBois,
        consoReseauVille: this.items.consoReseauVille,
        consoElecChauffage: this.items.consoElecChauffage,
        consoElecSpecifique: this.items.consoElecSpecifique,
        consoEau: this.items.consoEau,
        estTermine: this.estTermine
      },
      {headers}
    ).subscribe({
      next: () => this.loadResultats(id),
      error: err => console.error('Erreur lors de la mise à jour des consommations', err)
    });
  }

  loadResultats(id: string) {
    const headers = this.headers();
    if (!headers) return;

    this.http.get<any>(ApiEndpoints.EnergieOnglet.getResult(id), { headers }).subscribe({
      next: (res) => (this.resultats = res),
      error: (error) => console.error("Erreur lors du chargement des résultats", error)
    });
  }

  // ===================================================================
  // Conversion texte <-> nombre (ticket 26 : les décimales sont conservées)
  // ===================================================================

  /** 1234.5 -> « 1 234,5 » ; null -> « ». Jusqu'à 3 décimales, sans arrondi à l'entier. */
  formatNumber(value: unknown): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (!Number.isFinite(num)) return '';
    return num
      .toLocaleString('fr-FR', { maximumFractionDigits: DECIMALES_MAX })
      .replace(/[\u202f\u00a0]/g, ' ');
  }

  /**
   * « 1 234,5 » ou « 1234.5 » -> 1234.5. Un champ vidé vaut 0, pour que la valeur
   * effacée soit bien enregistrée (sinon le backend conserve l'ancienne, voir ticket 37).
   * Renvoie null si le texte n'est pas un nombre.
   */
  parseNumber(value: string | null | undefined): number | null {
    const texte = (value ?? '').replace(/[\s\u202f\u00a0]/g, '').replace(',', '.');
    if (texte === '') return 0;
    if (!/^-?\d*\.?\d+$|^-?\d+\.$/.test(texte)) return null;
    const num = Number(texte);
    if (!Number.isFinite(num)) return null;
    const facteur = 10 ** DECIMALES_MAX;
    return Math.round(num * facteur) / facteur;
  }
}
