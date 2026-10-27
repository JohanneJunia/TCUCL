import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OutilSuiviPageComponent } from './outil-suivi-page.component';
import { OutilSuiviService, OutilSuiviResponse } from '../../../services/outil-suivi.service';
import { SyntheseEgesService, SyntheseEgesResult } from '../../../services/synthese-eges.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ParamService } from '../../params/params.service';

/**
 * Ticket 30 — Un utilisateur ne voit que les données de son établissement.
 * Ces tests vérifient que le front ne demande jamais les données d'un autre établissement ;
 * le refus par l'API (403) se teste côté backend.
 */
describe('OutilSuiviPageComponent — cloisonnement des établissements (ticket 30)', () => {
  const ENTITE_A = 7;
  const ENTITE_B = 3;
  let fixture: ComponentFixture<OutilSuiviPageComponent>;
  let component: OutilSuiviPageComponent;
  let suivi: jasmine.SpyObj<OutilSuiviService>;
  let synthese: jasmine.SpyObj<SyntheseEgesService>;
  let params: jasmine.SpyObj<ParamService>;

  const reponseSuivi: OutilSuiviResponse = { real: null, mock: null, warnings: [], issuesByYear: {} };
  const reponseSynthese = { bilanCarboneTotalGlobal: 12, bilanCarboneTotalScope: 12, energieGlobal: 12 } as SyntheseEgesResult;

  async function creer(superAdmin: boolean) {
    suivi = jasmine.createSpyObj<OutilSuiviService>('OutilSuiviService', ['loadAll']);
    suivi.loadAll.and.returnValue(of(reponseSuivi));
    synthese = jasmine.createSpyObj<SyntheseEgesService>('SyntheseEgesService', ['getSynthese']);
    synthese.getSynthese.and.returnValue(of(reponseSynthese));
    params = jasmine.createSpyObj<ParamService>('ParamService', ['getAllEntiteNomId']);
    params.getAllEntiteNomId.and.returnValue(of([
      { id: ENTITE_B, nom: 'Etablissement B' },
      { id: ENTITE_A, nom: 'Etablissement A' },
      { id: 99, nom: 'global_default' },
    ]));

    await TestBed.configureTestingModule({
      imports: [OutilSuiviPageComponent],
      providers: [
        provideRouter([]),
        { provide: OutilSuiviService, useValue: suivi },
        { provide: SyntheseEgesService, useValue: synthese },
        { provide: ParamService, useValue: params },
        { provide: AuthService, useValue: { getToken: () => 'jeton' } },
        {
          provide: UserService,
          // Le superadmin de test n'est rattaché à aucun établissement (entiteId = 0)
          useValue: {
            isSuperAdmin: () => superAdmin,
            entite: () => (superAdmin ? '' : 'Etablissement A'),
            entiteId: () => (superAdmin ? 0 : ENTITE_A),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OutilSuiviPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const entitesDemandees = (spy: jasmine.Spy) => spy.calls.allArgs().map(args => args[0]);

  describe('administrateur de l’établissement A', () => {
    beforeEach(async () => creer(false));

    it('ne demande le suivi que pour son établissement', () => {
      expect(suivi.loadAll).toHaveBeenCalled();
      entitesDemandees(suivi.loadAll).forEach(id => expect(id).toBe(ENTITE_A));
    });

    it('ne demande la synthèse que pour son établissement', () => {
      expect(synthese.getSynthese).toHaveBeenCalled();
      entitesDemandees(synthese.getSynthese).forEach(id => expect(id).toBe(ENTITE_A));
    });

    it('ne charge pas la liste des établissements', () => {
      expect(params.getAllEntiteNomId).not.toHaveBeenCalled();
    });

    it('affiche son établissement en lecture seule, sans liste de choix', () => {
      expect(fixture.nativeElement.querySelector('select#entiteId')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Etablissement A');
    });

    it('l’onglet Synthèse reste sur son établissement', () => {
      component.activeTab = 'synthese';
      fixture.detectChanges();
      synthese.getSynthese.calls.reset();

      component.onSyntheseYearChange(component.syntheseYears[1].value);

      expect(synthese.getSynthese).toHaveBeenCalledOnceWith(ENTITE_A, component.syntheseYears[1].value);
    });
  });

  describe('superadmin', () => {
    beforeEach(async () => creer(true));

    it('charge la liste des établissements, sans l’entité technique global_default', () => {
      expect(params.getAllEntiteNomId).toHaveBeenCalled();
      expect(component.entites.map(e => e.nom)).toEqual(['Etablissement B', 'Etablissement A']);
    });

    it('affiche la liste de choix et sélectionne le premier établissement', () => {
      expect(fixture.nativeElement.querySelector('select#entiteId')).not.toBeNull();
      expect(component.selectedEntiteId).toBe(ENTITE_B);
      expect(suivi.loadAll).toHaveBeenCalledWith(ENTITE_B);
    });

    it('recharge le suivi et la synthèse de l’établissement choisi', () => {
      suivi.loadAll.calls.reset();
      synthese.getSynthese.calls.reset();

      component.onEntiteChange(ENTITE_A);

      expect(suivi.loadAll).toHaveBeenCalledOnceWith(ENTITE_A);
      entitesDemandees(synthese.getSynthese).forEach(id => expect(id).toBe(ENTITE_A));
      expect(component.entiteName).toBe('Etablissement A');
    });
  });
});
