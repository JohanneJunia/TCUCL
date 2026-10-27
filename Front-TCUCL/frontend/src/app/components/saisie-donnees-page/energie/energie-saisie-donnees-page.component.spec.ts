import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { EnergieSaisieDonneesPageComponent } from './energie-saisie-donnees-page.component';
import { AuthService } from '../../../services/auth.service';
import { ApiEndpoints } from '../../../services/api-endpoints';

/** Ticket 26 — Saisie des consommations : décimales conservées, unités valides. */
describe('EnergieSaisieDonneesPageComponent (ticket 26)', () => {
  const ID = '12';
  let fixture: ComponentFixture<EnergieSaisieDonneesPageComponent>;
  let component: EnergieSaisieDonneesPageComponent;
  let http: HttpTestingController;

  const donneesEnBase = {
    consoGaz: 1234.5, uniteGaz: 'MWH_PCS', consoFioul: null, uniteFioul: 'TONNE', consoBois: 0, uniteBois: 'TONNE',
    consoReseauVille: 0, consoElecChauffage: 0, consoElecSpecifique: 87.25, consoEau: 0, estTermine: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergieSaisieDonneesPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => 'jeton' } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: ID })), snapshot: { paramMap: convertToParamMap({ id: ID }) } },
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EnergieSaisieDonneesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(ApiEndpoints.EnergieOnglet.getById(ID)).flush(donneesEnBase);
    http.expectOne(ApiEndpoints.EnergieOnglet.getResult(ID)).flush({});
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  describe('conversion texte -> nombre', () => {
    [
      ['1 234,5', 1234.5],
      ['1234.5', 1234.5],
      ['0,125', 0.125],
      ['12,3456', 12.346],   // 3 décimales maximum
      ['1\u202f234,5', 1234.5], // espace fine insécable (format français)
      ['', 0],               // champ vidé = 0 (ticket 37)
    ].forEach(([saisie, attendu]) => {
      it(`« ${saisie} » donne ${attendu}`, () => {
        expect(component.parseNumber(saisie as string)).toBe(attendu as number);
      });
    });

    ['abc', '12,5,3', '1.2.3', '12a'].forEach(saisie => {
      it(`« ${saisie} » est refusé`, () => {
        expect(component.parseNumber(saisie)).toBeNull();
      });
    });
  });

  describe('conversion nombre -> texte', () => {
    it('garde les décimales (le bug du ticket 26 arrondissait à l’entier)', () => {
      expect(component.formatNumber(0.5)).toBe('0,5');
      expect(component.formatNumber(1234.5)).toBe('1 234,5');
      expect(component.formatNumber(87.25)).toBe('87,25');
    });

    it('affiche un champ vide pour une valeur absente', () => {
      expect(component.formatNumber(null)).toBe('');
      expect(component.formatNumber(undefined)).toBe('');
    });
  });

  it('affiche les valeurs chargées avec leurs décimales', () => {
    expect(component.affichage['consoGaz']).toBe('1 234,5');
    expect(component.affichage['consoElecSpecifique']).toBe('87,25');
    expect(component.affichage['consoFioul']).toBe('');
  });

  it('permet de taper une décimale sans qu’elle disparaisse pendant la saisie', () => {
    component.onFocus('consoGaz');
    expect(component.affichage['consoGaz']).toBe('1234,5'); // éditable, sans séparateur de milliers

    component.affichage['consoGaz'] = '12,';                 // saisie en cours
    fixture.detectChanges();
    expect(component.affichage['consoGaz']).toBe('12,');     // non reformaté tant que le champ a le focus
  });

  it('enregistre la valeur décimale exacte à la sortie du champ', () => {
    component.onFocus('consoGaz');
    component.affichage['consoGaz'] = '0,5';
    component.onBlur('consoGaz');

    const patch = http.expectOne(r => r.method === 'PATCH');
    expect(patch.request.body.consoGaz).toBe(0.5);
    patch.flush({});
    http.expectOne(ApiEndpoints.EnergieOnglet.getResult(ID)).flush({});

    expect(component.affichage['consoGaz']).toBe('0,5');
  });

  it('envoie 0 quand l’utilisateur vide le champ', () => {
    component.onFocus('consoElecSpecifique');
    component.affichage['consoElecSpecifique'] = '';
    component.onBlur('consoElecSpecifique');

    const patch = http.expectOne(r => r.method === 'PATCH');
    expect(patch.request.body.consoElecSpecifique).toBe(0);
    patch.flush({});
    http.expectOne(ApiEndpoints.EnergieOnglet.getResult(ID)).flush({});
  });

  it('refuse une saisie non numérique ou négative, sans rien envoyer', () => {
    component.affichage['consoGaz'] = 'beaucoup';
    component.onBlur('consoGaz');
    expect(component.erreurs['consoGaz']).toContain('Saisissez un nombre');

    component.affichage['consoGaz'] = '-5';
    component.onBlur('consoGaz');
    expect(component.erreurs['consoGaz']).toContain('négative');

    http.expectNone(r => r.method === 'PATCH');
    expect(component.items.consoGaz).toBe(1234.5);
  });

  it('n’envoie rien si la valeur n’a pas changé', () => {
    component.onFocus('consoGaz');
    component.onBlur('consoGaz');
    http.expectNone(r => r.method === 'PATCH');
  });

  it('ne propose plus l’unité « Tonnes » pour le gaz, inconnue du backend', () => {
    const gaz = component.lignes.find(l => l.champ === 'consoGaz')!;
    expect(gaz.unites!.map(u => u.valeur)).toEqual(['MWH_PCS', 'M3']);

    const options: string[] = Array.from(
      (fixture.nativeElement.querySelector('tbody tr select') as HTMLSelectElement).options,
    ).map(o => o.value);
    expect(options).not.toContain('TONNE');
  });
});
