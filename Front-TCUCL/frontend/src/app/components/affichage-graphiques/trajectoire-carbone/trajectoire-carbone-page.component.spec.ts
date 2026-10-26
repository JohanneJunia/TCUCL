import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TrajectoireCarbonePageComponent } from './trajectoire-carbone-page.component';
import { TrajectoireService } from '../../../services/trajectoire.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ParamService } from '../../params/params.service';
import { Trajectoire } from '../../../models/trajectoire.model';

/**
 * Ticket 28 — Un utilisateur qui n'est pas superadmin ne peut pas modifier les paramètres
 * de la trajectoire. Ces tests couvrent l'interface ; le refus côté API se teste au backend.
 */
describe('TrajectoireCarbonePageComponent — droits de modification (ticket 28)', () => {
  const ENTITE_UTILISATEUR = 7;
  let fixture: ComponentFixture<TrajectoireCarbonePageComponent>;
  let component: TrajectoireCarbonePageComponent;
  let trajectoire: jasmine.SpyObj<TrajectoireService>;
  let params: jasmine.SpyObj<ParamService>;

  const trajectoireEnBase: Trajectoire = {
    entiteId: ENTITE_UTILISATEUR, referenceYear: 2019, targetYear: 2030, targetPercentage: 32, lockGlobal: false, postesReglages: [],
  };

  async function creer(superAdmin: boolean) {
    trajectoire = jasmine.createSpyObj<TrajectoireService>('TrajectoireService', ['get', 'getPostesDefaults', 'upsert', 'propagateGlobal']);
    trajectoire.get.and.returnValue(of({ real: trajectoireEnBase, mock: null, warnings: [] }));
    trajectoire.getPostesDefaults.and.returnValue(of([
      { id: 'energie', nom: 'Énergie', emissionsReference: 100, reductionBasePct: 30 },
      { id: 'batiments', nom: 'Bâtiments', emissionsReference: 50, reductionBasePct: 40 },
    ]));
    trajectoire.upsert.and.callFake((_id: number, dto: Trajectoire) => of(dto));
    trajectoire.propagateGlobal.and.returnValue(of(void 0));

    params = jasmine.createSpyObj<ParamService>('ParamService', ['getAllEntiteNomId']);
    params.getAllEntiteNomId.and.returnValue(of([{ id: 3, nom: 'Etablissement B' }]));

    await TestBed.configureTestingModule({
      imports: [TrajectoireCarbonePageComponent],
      providers: [
        provideRouter([]),
        { provide: TrajectoireService, useValue: trajectoire },
        { provide: ParamService, useValue: params },
        { provide: AuthService, useValue: { getToken: () => 'jeton' } },
        {
          provide: UserService,
          useValue: { isSuperAdmin: () => superAdmin, entite: () => 'Etablissement A', entiteId: () => ENTITE_UTILISATEUR },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrajectoireCarbonePageComponent);
    component = fixture.componentInstance;
    // Pas de graphique Chart.js dans les tests
    spyOn<any>(component, 'initChartIfPossible').and.returnValue(Promise.resolve());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  describe('administrateur d’établissement (non superadmin)', () => {
    beforeEach(async () => creer(false));

    it('est en consultation seule', () => {
      expect(component.canEdit).toBeFalse();
      expect(fixture.nativeElement.textContent).toContain('Consultation (non super admin)');
    });

    it('ne charge que la trajectoire de son propre établissement', () => {
      expect(trajectoire.get).toHaveBeenCalledWith(ENTITE_UTILISATEUR);
      expect(params.getAllEntiteNomId).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('#entiteSelect')).toBeNull();
    });

    it('voit les années et le curseur global désactivés', () => {
      const champs: NodeListOf<HTMLInputElement | HTMLSelectElement> =
        fixture.nativeElement.querySelectorAll('.filters select, .filters input[type="range"]');
      expect(champs.length).toBe(3);
      champs.forEach(champ => expect(champ.disabled).withContext(champ.outerHTML).toBeTrue());
    });

    it('voit les curseurs des postes et la réinitialisation désactivés', async () => {
      component.toggleAdvancedMode();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const curseurs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('.advanced-grid input[type="range"]');
      expect(curseurs.length).toBe(2);
      curseurs.forEach(c => expect(c.disabled).toBeTrue());

      const verrou: HTMLInputElement = fixture.nativeElement.querySelector('.lock-toggle input');
      expect(verrou.disabled).toBeTrue();
    });

    it('ne modifie pas l’objectif et n’envoie rien au backend, même si la méthode est appelée', () => {
      const avant = component.reduction;

      component.onReductionInput({ target: { value: '90' } } as unknown as Event);
      component.onStartYearSelect(2020);
      component.onEndYearSelect(2040);
      component.onPosteReductionChange('energie');
      component.resetPostes();
      component.saveSettings();
      component.propagateGlobal();

      expect(component.reduction).toBe(avant);
      expect(component.startYear).toBe(2019);
      expect(component.endYear).toBe(2030);
      expect(trajectoire.upsert).not.toHaveBeenCalled();
      expect(trajectoire.propagateGlobal).not.toHaveBeenCalled();
    });
  });

  describe('superadmin', () => {
    beforeEach(async () => creer(true));

    it('peut modifier, et charge par défaut la trajectoire globale (entité 0)', () => {
      expect(component.canEdit).toBeTrue();
      expect(trajectoire.get).toHaveBeenCalledWith(0);
      expect(params.getAllEntiteNomId).toHaveBeenCalled();
    });

    it('enregistre l’objectif global pour l’entité sélectionnée', () => {
      component.onReductionInput({ target: { value: '45' } } as unknown as Event);

      expect(component.reduction).toBe(45);
      expect(trajectoire.upsert).toHaveBeenCalledWith(0, jasmine.objectContaining({ entiteId: 0, targetPercentage: 45 }));
    });

    it('enregistre pour l’établissement choisi, et pas pour un autre', () => {
      component.onEntiteChange(3);
      trajectoire.upsert.calls.reset();

      component.onReductionInput({ target: { value: '50' } } as unknown as Event);

      expect(trajectoire.upsert).toHaveBeenCalledOnceWith(3, jasmine.objectContaining({ entiteId: 3, targetPercentage: 50 }));
    });
  });
});
