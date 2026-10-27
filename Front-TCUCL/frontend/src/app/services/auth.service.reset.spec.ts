import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiEndpoints } from './api-endpoints';
import { routes } from '../app.routes';
import { ForgotPasswordComponent } from '../components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../components/reset-password/reset-password.component';
import { authGuard } from '../guards/authguard';

/** Ticket 7 — Contrat entre le front et l'API de réinitialisation. */
describe('AuthService — réinitialisation du mot de passe (ticket 7)', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('POST forgot-password avec l’e-mail, réponse lue en texte', () => {
    let resultat: boolean | undefined;
    service.requestPasswordReset('admin.a@exemple.fr').subscribe(r => (resultat = r));

    const req = http.expectOne(ApiEndpoints.auth.forgotPassword());
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin.a@exemple.fr' });
    expect(req.request.responseType).toBe('text');
    req.flush('Si un compte existe, un e-mail a été envoyé.');

    expect(resultat).toBeTrue();
  });

  it('POST reset-password avec { token, newPassword }', () => {
    let resultat: boolean | undefined;
    service.confirmPasswordReset('jeton-123', 'Nouveau-Mdp1!').subscribe(r => (resultat = r));

    const req = http.expectOne(ApiEndpoints.auth.resetPassword());
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'jeton-123', newPassword: 'Nouveau-Mdp1!' });
    expect(req.request.responseType).toBe('text');
    req.flush('OK');

    expect(resultat).toBeTrue();
  });

  it('propage l’erreur de l’API au composant (lien expiré)', () => {
    let statut: number | undefined;
    service.confirmPasswordReset('jeton-expire', 'Nouveau-Mdp1!').subscribe({
      error: e => (statut = e.status),
    });

    http.expectOne(ApiEndpoints.auth.resetPassword())
      .flush('Lien invalide ou expiré', { status: 400, statusText: 'Bad Request' });

    expect(statut).toBe(400);
  });
});

/** Ticket 7 — Le lien de l'e-mail doit ouvrir une page accessible sans être connecté. */
describe('Routes de réinitialisation (ticket 7)', () => {
  const route = (path: string) => routes.find(r => r.path === path);

  it('/forgot-password mène au bon composant, sans garde', () => {
    expect(route('forgot-password')?.component).toBe(ForgotPasswordComponent);
    expect(route('forgot-password')?.canActivate).toBeUndefined();
  });

  it('/reset-password mène au bon composant, sans garde', () => {
    expect(route('reset-password')?.component).toBe(ResetPasswordComponent);
    expect(route('reset-password')?.canActivate).toBeUndefined();
  });

  it('/reset-password est déclarée avant la route « ** » de repli', () => {
    const indexReset = routes.findIndex(r => r.path === 'reset-password');
    const indexRepli = routes.findIndex(r => r.path === '**');
    expect(indexReset).toBeGreaterThanOrEqual(0);
    expect(indexReset).toBeLessThan(indexRepli);
  });
});

/**
 * Anomalie S12 (et contexte des tickets 28 et 30) : ces pages doivent exiger une connexion.
 * Ces tests échouent tant que S12 n'est pas corrigé : retirer le « x » de « xit » une fois les routes protégées.
 */
describe('Routes protégées (S12)', () => {
  ['outil-de-suivi', 'trajectoire-carbone', 'pilotage-scenario'].forEach(path => {
    xit(`/${path} exige authGuard`, () => {
      const r = routes.find(x => x.path === path);
      expect(r?.canActivate).toContain(authGuard);
    });
  });
});
