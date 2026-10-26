  import { Component, inject, OnInit } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { HttpClient, HttpClientModule } from '@angular/common/http';
  import { ActivatedRoute } from '@angular/router';
  import { AuthService } from '../../../services/auth.service';
  import { ApiEndpoints } from '../../../services/api-endpoints';
  import { CommonModule } from '@angular/common';
  import { SaveFooterComponent } from '../../save-footer/save-footer.component';
  import { OngletStatusService } from '../../../services/onglet-status.service';
  import { AchatMapperService } from './achat-mapper.service';
  import { ONGLET_KEYS } from '../../../constants/onglet-keys';
  import {ResultatAchatDTO} from '../../../models/achat.model';

  @Component({
    selector: 'app-achats-saisie-donnees-page',
    standalone: true,
    templateUrl: './achats-saisie-donnees-page.component.html',
    styleUrls: ['./achats-saisie-donnees-page.component.scss'],
    imports: [CommonModule, FormsModule, HttpClientModule, SaveFooterComponent]
  })
  export class AchatsSaisieDonneesPageComponent implements OnInit {
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);
    private statusService = inject(OngletStatusService);
    private mapper = inject(AchatMapperService);

    items: any = {};
    estTermine = false;
    ONGLET_KEYS = ONGLET_KEYS;
    totalGlobalAchats: number = 0;
    resultatAchats: ResultatAchatDTO | null = null;
    resultatAchatsEntries: { key: string, value: any }[] = [];

    consommablesFields = [
      { label: 'Papier', unit: 'Tonnes', key: 'papierConsTonnes' },
      { label: 'Papier', unit: 'Ramettes', key: 'papierConsRamettes' },
      { label: 'Livres', unit: 'Tonnes', key: 'livresConsTonnes' },
      { label: 'Livres', unit: 'Nb', key: 'livresConsNb' },
      { label: 'Carton neuf', unit: 'Tonnes', key: 'cartonNeufCons' },
      { label: 'Carton recycle', unit: 'Tonnes', key: 'cartonRecycleCons' },
      { label: 'Petites fournitures', unit: 'EUR', key: 'fournituresCons' },
      { label: "Impressions jet d'encre", unit: 'Ramettes', key: 'jetEncreCons' },
      { label: 'Impressions toner', unit: 'Ramettes', key: 'tonerCons' },
      { label: 'Produits pharmaceutiques', unit: 'EUR', key: 'pharmaCons' },
      { label: 'Services (imprimerie, publicité, architecture et ingénierie, maintenance multi-technique des bâtiments)', unit: 'EUR', key: 'servicesCons' },
      { label: 'Service/Enseignement', unit: 'EUR', key: 'serviceEnseignementCons' },
      { label: 'Service/Produits informatiques, électroniques et optiques', unit: 'EUR', key: 'serviceProduitsInformatiqueCons' },
      { label: "Service/Réparation et installation de machines et d'équipements", unit: 'EUR', key: 'serviceReparationsMachinesCons' },
      { label: 'Service/Transport terrestre', unit: 'EUR', key: 'serviceTransportCons' },
      { label: 'Service/"hébergement et restauration"', unit: 'EUR', key: 'serviceHebergementRestaurationCons' },
      { label: 'Service de télécommunications', unit: 'EUR', key: 'serviceTelecomCons' }
    ];

    textileFields = [
      { label: 'Chemise', unit: 'Nb', key: 'chemise' },
      { label: 'Polaire', unit: 'Nb', key: 'polaire' },
      { label: 'Pull acrylique', unit: 'Nb', key: 'pullAcrylique' },
      { label: 'Pull coton', unit: 'Nb', key: 'pullCoton' },
      { label: 'T-shirt polyester', unit: 'Nb', key: 'tshirtPolyester' },
      { label: 'Jean', unit: 'Nb', key: 'jean' },
      { label: 'Sweat', unit: 'Nb', key: 'sweat' },
      { label: 'Veste/Anorak', unit: 'Nb', key: 'veste' },
      { label: 'Manteau', unit: 'Nb', key: 'manteau' },
      { label: 'Chaussure', unit: 'Nb', key: 'chaussure' }
    ];

    alimentsFields = [
      { label: 'Boeuf/agneau/mouton', key: 'boeufAgneauMouton' },
      { label: 'Poulet', key: 'poulet' },
      { label: 'Café', key: 'cafe' },
      { label: 'Chocolat', key: 'chocolat' },
      { label: 'Beurre', key: 'beurre' },
      { label: 'Viandes – moyenne', key: 'viandesMoyenne' },
      { label: 'Produits sucrés – moyenne', key: 'produitsSucresMoyenne' },
      { label: 'Poissons – moyenne', key: 'poissonsMoyenne' },
      { label: 'Fromages – moyenne', key: 'fromagesMoyenne' },
      { label: 'Oléagineux – moyenne', key: 'oleagineuxMoyenne' },
      { label: 'Matières grasses – moyenne', key: 'matieresGrassesMoyenne' },
      { label: 'Boissons – moyenne', key: 'boissonsMoyenne' },
      { label: 'Œufs', key: 'oeufs' },
      { label: 'Céréales – moyenne', key: 'cerealesMoyenne' },
      { label: 'Légumes – moyenne', key: 'legumesMoyenne' },
      { label: 'Fruits – moyenne', key: 'fruitsMoyenne' },
      { label: 'Légumineuse – moyenne', key: 'legumineuseMoyenne' }
    ];

    repasFields = [
      { label: 'Nombre de repas servis – dominante animale boeuf', key: 'nombreRepasServisDominanteAnimaleBoeuf' },
      { label: 'Nombre de repas servis – dominante animale poulet', key: 'nombreRepasServisDominanteAnimalePoulet' },
      { label: 'Nombre de repas servis – dominante végétale boeuf', key: 'nombreRepasServisDominanteVegetaleBoeuf' },
      { label: 'Nombre de repas servis – dominante végétale poulet', key: 'nombreRepasServisDominanteVegetalePoulet' },
      { label: 'Nombre de repas servis – dominante classique boeuf', key: 'nombreRepasServisDominanteClassiqueBoeuf' },
      { label: 'Nombre de repas servis – dominante classique poulet', key: 'nombreRepasServisDominanteClassiquePoulet' },
      { label: 'Nombre de repas servis – repas moyen', key: 'nombreRepasServisRepasMoyen' },
      { label: 'Nombre de repas servis – repas végétarien', key: 'nombreRepasServisRepasVegetarien' }
    ];

    labelMapping: { [key: string]: string } = {
      papier_T: 'Papier (tonnes)',
      papier_nb: 'Papier (ramettes)',
      livres_T: 'Livres (tonnes)',
      livres_nb: 'Livres (exemplaires)',
      cartonNeuf_T: 'Carton neuf',
      cartonRecycle_T: 'Carton recyclé',
      petitesFournitures_Eur: 'Petites fournitures',
      nbFeuillesImprimeesJetEncre_Nb: 'Impressions jet d’encre',
      nbFeuillesImprimeesToner_Nb: 'Impressions toner',
      produitsPharmaceutiques_Eur: 'Produits pharmaceutiques',
      services_imprimerie_publicite_architecture_ingenierie_maintenance_multi_technique_des_batiments: 'Services divers bâtiments',
      service_Enseignement: 'Services enseignement',
      service_Produits_informatiques_electroniques_et_optiques: 'Services informatiques / électroniques',
      service_Reparation_et_installation_de_machines_et_d_equipements: 'Services réparation / installations',
      service_Transport_terrestre: 'Transport terrestre',
      service_hebergement_et_restauration: 'Hébergement / restauration',
      service_de_telecommunications: 'Télécommunications',
      totalPosteAchat: 'Sous-total consommables',
      totalPosteTextile: 'Sous-total textile',
      methodeRapideNombrePersonnesServiesRegimeClassique: 'Personnes servies - régime classique',
      methodeRapideNombrePersonnesServiesRegimeFlexitarien: 'Personnes servies - régime flexitarien',
      nombreRepasServisDominanteAnimaleBoeuf: 'Repas dominante animale - bœuf',
      nombreRepasServisDominanteAnimalePoulet: 'Repas dominante animale - poulet',
      nombreRepasServisDominanteVegetaleBoeuf: 'Repas dominante végétale - bœuf',
      nombreRepasServisDominanteVegetalePoulet: 'Repas dominante végétale - poulet',
      nombreRepasServisDominanteClassiqueBoeuf: 'Repas classique - bœuf',
      nombreRepasServisDominanteClassiquePoulet: 'Repas classique - poulet',
      nombreRepasServisRepasMoyen: 'Repas moyen',
      nombreRepasServisRepasVegetarien: 'Repas végétarien',
      boeufAgneauMouton_Tonnes: 'Bœuf / agneau / mouton',
      poulet_Tonnes: 'Poulet',
      cafe_Tonnes: 'Café',
      chocolat_Tonnes: 'Chocolat',
      beurre_Tonnes: 'Beurre',
      viandesMoyenne_Tonnes: 'Viandes moyennes',
      produitsSucresMoyenne_Tonnes: 'Produits sucrés',
      poissonsMoyenne_Tonnes: 'Poissons',
      fromagesMoyenne_Tonnes: 'Fromages',
      oleagineuxMoyenne_Tonnes: 'Oléagineux',
      matieresGrassesMoyenne_Tonnes: 'Matières grasses',
      boissonsMoyenne_Tonnes: 'Boissons',
      oeufs_Tonnes: 'Œufs',
      cerealesMoyenne_Tonnes: 'Céréales',
      legumesMoyenne_Tonnes: 'Légumes',
      fruitsMoyenne_Tonnes: 'Fruits',
      legumineuseMoyenne_Tonnes: 'Légumineuses',
      totalPosteRestauration: 'Sous-total restauration',
      jean_nb: 'Jean',
      pull_Acrylique_nb: 'Pull acrylique',
      t_shirt_polyester_nb: 'T-shirt polyester',
      chemise_nb: 'Chemise',
      polaire_nb: 'Polaire',
      sweat_nb: 'Sweat',
      veste_Anorak_nb: 'Veste / Anorak',
      manteau_nb: 'Manteau',
      chaussure_nb: 'Chaussure',
      pull_Coton_nb: 'Pull coton'
    };

    onEstTermineChange(value: boolean): void {
      this.estTermine = value;
      this.updateAchat();
    }

    ngOnInit() {
      this.estTermine = this.statusService.getStatus(ONGLET_KEYS.Achats);
      this.statusService.statuses$.subscribe((statuses: Record<string, boolean>) => {
        this.estTermine = statuses[ONGLET_KEYS.Achats] ?? false;
      });

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadData(id);
          this.getResultatAchats(id);
        }
      });
    }

    loadData(id: string) {
      const token = this.authService.getToken();
      if (!token) return;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      this.http.get<any>(ApiEndpoints.AchatsOnglet.getById(id), { headers }).subscribe({
        next: data => {
          this.items = this.mapper.fromDto(data);
          this.estTermine = this.items.estTermine ?? false;
          this.statusService.setStatus(ONGLET_KEYS.Achats, this.estTermine);
          this.getResultatAchats(id);
        },
        error: err => console.error("Erreur de chargement", err)
      });


    }

    updateAchat(): void {
      const id = this.route.snapshot.paramMap.get('id');
      const token = this.authService.getToken();
      if (!id || !token) return;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const payload = this.mapper.toDto({ ...this.items, estTermine: this.estTermine });
      this.http.patch(ApiEndpoints.AchatsOnglet.update(id), payload, { headers }).subscribe({
        next: () => {
          this.getResultatAchats(id);
        },
        error: err => console.error("PATCH achats échoué", err)
      });

    }

    getResultatAchats(ongletId: string): void {
      const token = this.authService.getToken();
      if (!ongletId || !token) return;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      this.http.get<ResultatAchatDTO>(ApiEndpoints.AchatsOnglet.resultat(ongletId), {headers})
        .subscribe({
          next: (resultat) => {
            this.resultatAchats = resultat;
            this.totalGlobalAchats = (resultat.totalPosteAchat || 0) + (resultat.totalPosteTextile || 0) + (resultat.totalPosteRestauration || 0);
            this.resultatAchatsEntries = Object.entries(resultat)
              .filter(([key, value]) => !['totalPosteAchat', 'totalPosteTextile', 'totalPosteRestauration'].includes(key) && typeof value === 'number' && !isNaN(value) && value > 0)
              .map(([key, value]) => ({ key, value }));
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des résultats Achats :', err);
          }
        });
    }

    isNumeric(value: any): boolean {
      return typeof value === 'number' && !isNaN(value);
    }

    formatLabel(key: string): string {
      return this.labelMapping[key] || key;
    }
  }
