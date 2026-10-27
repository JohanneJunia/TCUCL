import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../services/auth.service';

/** Ticket 7 — Page ouverte depuis le lien reçu par e-mail. */
describe('ResetPasswordComponent (ticket 7)', () => {
  let auth: jasmine.SpyObj<AuthService>;

  async function creer(queryParams: Record<string, string>) {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['confirmPasswordReset']);
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: ActivatedRoute, useValue: { queryParams: of(queryParams) } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<ResetPasswordComponent> = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  const MDP_VALIDE = 'Nouveau-Mdp1!';

  describe('lien avec jeton', () => {
    it('lit le jeton dans l’adresse et affiche le formulaire', async () => {
      const { fixture, component } = await creer({ token: 'jeton-123' });
      expect(component.token).toBe('jeton-123');
      expect(component.tokenValid).toBeTrue();
      expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    });

    it('envoie le jeton et le nouveau mot de passe, puis affiche le succès', async () => {
      const { component } = await creer({ token: 'jeton-123' });
      auth.confirmPasswordReset.and.returnValue(of(true));
      component.newPassword = MDP_VALIDE;
      component.confirmPassword = MDP_VALIDE;

      component.onSubmit();

      expect(auth.confirmPasswordReset).toHaveBeenCalledOnceWith('jeton-123', MDP_VALIDE);
      expect(component.isSuccess).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });

    it('refuse une confirmation différente sans appeler l’API', async () => {
      const { component } = await creer({ token: 'jeton-123' });
      component.newPassword = MDP_VALIDE;
      component.confirmPassword = 'Autre-Mdp1!';

      component.onSubmit();

      expect(auth.confirmPasswordReset).not.toHaveBeenCalled();
      expect(component.errorMessage).toContain('ne correspondent pas');
    });

    it('refuse un mot de passe de moins de 10 caractères', async () => {
      const { component } = await creer({ token: 'jeton-123' });
      component.newPassword = component.confirmPassword = 'Ab1!court';

      component.onSubmit();

      expect(auth.confirmPasswordReset).not.toHaveBeenCalled();
      expect(component.errorMessage).toContain('au moins 10 caractères');
    });

    [
      ['sans majuscule', 'nouveau-mdp1!'],
      ['sans minuscule', 'NOUVEAU-MDP1!'],
      ['sans chiffre', 'Nouveau-Mdpx!'],
      ['sans caractère spécial', 'NouveauMdp12'],
    ].forEach(([cas, mdp]) => {
      it(`refuse un mot de passe ${cas}`, async () => {
        const { component } = await creer({ token: 'jeton-123' });
        component.newPassword = component.confirmPassword = mdp;

        component.onSubmit();

        expect(auth.confirmPasswordReset).not.toHaveBeenCalled();
        expect(component.errorMessage).toContain('majuscule');
      });
    });

    it('signale un lien invalide ou expiré (400)', async () => {
      const { component } = await creer({ token: 'jeton-expire' });
      auth.confirmPasswordReset.and.returnValue(throwError(() => ({ status: 400, error: '' })));
      component.newPassword = component.confirmPassword = MDP_VALIDE;

      component.onSubmit();

      expect(component.isSuccess).toBeFalse();
      expect(component.errorMessage).toContain('invalide ou expiré');
    });

    it('signale un trop grand nombre de demandes (429)', async () => {
      const { component } = await creer({ token: 'jeton-123' });
      auth.confirmPasswordReset.and.returnValue(throwError(() => ({ status: 429, error: '' })));
      component.newPassword = component.confirmPassword = MDP_VALIDE;

      component.onSubmit();

      expect(component.errorMessage).toContain('Trop de demandes');
    });
  });

  describe('lien sans jeton', () => {
    it('affiche « Lien invalide » et masque le formulaire', async () => {
      const { fixture, component } = await creer({});
      expect(component.tokenValid).toBeFalse();
      expect(component.errorMessage).toContain('invalide');
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Lien invalide');
    });
  });
});
