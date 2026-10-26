import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BatimentsSaisieDonneesPageComponent } from './bat-saisie-donnees-page.component';
import { BatimentsService } from './bat.service';
import { AuthService } from '../../../services/auth.service';
import { BatimentResultat } from '../../../models/batiment-resultat.model';
import {
  EnumBatiment_TypeBatiment,
  EnumBatiment_TypeMobilier,
  EnumBatiment_TypeStructure,
  EnumBatiment_TypeTravaux,
} from '../../../models/bat.enum';

/**
 * Ticket 15 — Le total CO2 de l'onglet Bâtiments se met à jour après chaque ajout
 * ou suppression, sans rafraîchissement manuel. (Inclut aussi des cas du ticket 1, côté front.)
 */
describe('BatimentsSaisieDonneesPageComponent — mise à jour des totaux (ticket 15)', () => {
  const ONGLET_ID = '5';
  let fixture: ComponentFixture<BatimentsSaisieDonneesPageComponent>;
  let component: BatimentsSaisieDonneesPageComponent;
  let bat: jasmine.SpyObj<BatimentsService>;

  // État « serveur » simulé : ce que renverront les prochains appels
  let donnees: any;
  let resultat: BatimentResultat;

  const resultatAvec = (batiment: number, entretien = 0, mobilier = 0): BatimentResultat => ({
    emissionGESBatimentExistantOuNeufConstruit: {},
    emissionGESEntretienCourant: {},
    emissionGESMobilierElectromenager: {},
    totalPosteBatiment: batiment,
    totalPosteEntretien: entretien,
    totalPosteMobilier: mobilier,
  });

  const batimentValide = () => ({
    nom_ou_adresse: 'Bât A',
    dateConstruction: '2010-01-01',
    dateDerniereGrosseRenovation: null,
    acvBatimentRealisee: false,
    emissionsGesReellesTCO2: null,
    typeBatiment: EnumBatiment_TypeBatiment.BUREAUX,
    surfaceEnM2: 1000,
    typeStructure: EnumBatiment_TypeStructure.BETON,
  });

  const textePanneauResultats = () => {
    fixture.detectChanges();
    return (fixture.nativeElement.querySelector('.bottom-panel') as HTMLElement).textContent ?? '';
  };

  beforeEach(async () => {
    donnees = { estTermine: false, batimentsExistantOuNeufConstruits: [], entretiensCourants: [], mobiliersElectromenagers: [] };
    resultat = resultatAvec(0);

    bat = jasmine.createSpyObj<BatimentsService>('BatimentsService', [
      'getBatimentImmobilisationMobilier', 'chargerResultatGES', 'ajouterBatiment', 'ajouterEntretien',
      'ajouterMobilier', 'supprimerBatiment', 'supprimerEntretien', 'supprimerMobilier', 'updateOnglet',
    ]);
    bat.getBatimentImmobilisationMobilier.and.callFake(() => of(donnees));
    bat.chargerResultatGES.and.callFake(() => of(resultat));
    bat.ajouterBatiment.and.returnValue(of({}));
    bat.ajouterEntretien.and.returnValue(of({}));
    bat.ajouterMobilier.and.returnValue(of({}));
    bat.supprimerBatiment.and.returnValue(of({}));
    bat.supprimerEntretien.and.returnValue(of({}));
    bat.supprimerMobilier.and.returnValue(of({}));
    bat.updateOnglet.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [BatimentsSaisieDonneesPageComponent],
      providers: [
        { provide: BatimentsService, useValue: bat },
        { provide: AuthService, useValue: { getToken: () => 'jeton' } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: ONGLET_ID })),
            snapshot: { paramMap: convertToParamMap({ id: ONGLET_ID }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BatimentsSaisieDonneesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit : chargement initial des données et des résultats
  });

  it('charge les résultats à l’ouverture de l’onglet', () => {
    expect(bat.chargerResultatGES).toHaveBeenCalledWith(ONGLET_ID, jasmine.any(Object));
    expect(component.totalPosteBatiment).toBe(0);
  });

  it('15.1 — ajout d’un bâtiment : le total change immédiatement', () => {
    const appelsAvant = bat.chargerResultatGES.calls.count();
    resultat = resultatAvec(2);
    component.nouveauBatiment = batimentValide();

    component.ajouterBatiment();

    expect(bat.ajouterBatiment).toHaveBeenCalledWith(ONGLET_ID, jasmine.objectContaining({ nom_ou_adresse: 'Bât A' }), jasmine.any(Object));
    expect(bat.chargerResultatGES.calls.count()).toBe(appelsAvant + 1);
    expect(component.totalPosteBatiment).toBe(2);
    expect(textePanneauResultats()).toContain('2');
  });

  it('15.2 — deuxième ajout : le total augmente de nouveau', () => {
    resultat = resultatAvec(2);
    component.nouveauBatiment = batimentValide();
    component.ajouterBatiment();

    resultat = resultatAvec(5.5);
    component.nouveauBatiment = { ...batimentValide(), nom_ou_adresse: 'Bât B' };
    component.ajouterBatiment();

    expect(component.totalPosteBatiment).toBe(5.5);
  });

  it('15.3 — suppression d’un bâtiment : le total diminue', () => {
    donnees = { ...donnees, batimentsExistantOuNeufConstruits: [{ id: 11, ...batimentValide() }] };
    resultat = resultatAvec(2);
    component.loadData();
    component.chargerResultatGES();
    expect(component.totalPosteBatiment).toBe(2);

    donnees = { ...donnees, batimentsExistantOuNeufConstruits: [] };
    resultat = resultatAvec(0);
    component.supprimerBatiment(0);

    expect(bat.supprimerBatiment).toHaveBeenCalledWith(ONGLET_ID, 11, jasmine.any(Object));
    expect(component.totalPosteBatiment).toBe(0);
    expect(component.batimentOnglet.batiments.length).toBe(0);
  });

  it('15.4 — ajout d’une rénovation : le total « Entretien » change', () => {
    resultat = resultatAvec(0, 1.25);
    component.nouvelleReno = {
      nom_adresse: 'Bât A', typeTravaux: EnumBatiment_TypeTravaux.ELECTRICITE, dateTravaux: '2025-03-01',
      typeBatiment: EnumBatiment_TypeBatiment.BUREAUX, surfaceConcernee: 300, dureeAmortissement: 10,
    };

    component.ajouterEntretien();

    expect(bat.ajouterEntretien).toHaveBeenCalled();
    expect(component.totalPosteEntretien).toBe(1.25);
  });

  it('15.5 — ajout puis suppression d’un mobilier : le total revient à sa valeur', () => {
    resultat = resultatAvec(0, 0, 0.4);
    component.nouveauMobilier = { mobilier: EnumBatiment_TypeMobilier.TABLE, quantite: 10, poidsDuProduit: null, dureeAmortissement: 10 };
    component.ajouterMobilier();
    expect(component.totalPosteMobilier).toBe(0.4);

    donnees = { ...donnees, mobiliersElectromenagers: [{ id: 21, mobilier: 'TABLE', quantite: 10, dureeAmortissement: 10 }] };
    component.loadData();
    resultat = resultatAvec(0, 0, 0);
    component.supprimerMobilier(0);

    expect(bat.supprimerMobilier).toHaveBeenCalledWith(ONGLET_ID, 21, jasmine.any(Object));
    expect(component.totalPosteMobilier).toBe(0);
  });

  it('un formulaire incomplet n’envoie rien et ne change pas le total (ticket 1)', () => {
    resultat = resultatAvec(9);
    component.nouveauBatiment = { ...batimentValide(), typeStructure: EnumBatiment_TypeStructure.NA };

    component.ajouterBatiment();

    expect(bat.ajouterBatiment).not.toHaveBeenCalled();
    expect(component.erreursBatiment).toContain('Choisissez le type de structure.');
    expect(component.totalPosteBatiment).toBe(0);
  });

  it('un échec d’enregistrement affiche une erreur et ne change pas le total', () => {
    bat.ajouterBatiment.and.returnValue(throwError(() => new Error('500')));
    resultat = resultatAvec(9);
    component.nouveauBatiment = batimentValide();

    component.ajouterBatiment();

    expect(component.erreurServeur).toContain('a échoué');
    expect(component.totalPosteBatiment).toBe(0);
  });
});
