import {Injectable, signal} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {ApiEndpoints} from './api-endpoints';

export interface UserInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  estAdmin: boolean;
  superAdmin: boolean;
  entiteNom: string;
  entiteId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = signal(false);
  userInfo = signal<UserInfo | null>(null);

  constructor(private router: Router, private http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem('user_info');
    if (token) {
      if (this.isTokenExpired(token)) {
        this.logout();
        return;
      }
      this.isAuthenticated.set(true);
      if (storedUser) {
        try {
          this.userInfo.set(JSON.parse(storedUser));
        } catch (e) {
          console.error('Erreur parsing user_info', e);
        }
      }
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  login(email: string, password: string): Observable<boolean> {
    const loginData = { email: email, mdp: password };

    return this.http
      .post<{ jeton: string; user: UserInfo }>(
        ApiEndpoints.auth.connexion(),
        loginData
      )
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.jeton);
          localStorage.setItem('user_info', JSON.stringify(response.user));
          this.userInfo.set(response.user);
          this.isAuthenticated.set(true);
        }),
        map(() => true),
        catchError(error => {
          console.error('Erreur login', error);
          this.isAuthenticated.set(false);
          return of(false);
        })
      );
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.userInfo.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    this.router.navigate(['/login']);
  }

  requestPasswordReset(email: string): Observable<boolean> {
    return this.http
      .post(ApiEndpoints.auth.forgotPassword(), { email }, { responseType: 'text' })
      .pipe(
        map(() => true)
      );
  }

  confirmPasswordReset(token: string, newPassword: string): Observable<boolean> {
    return this.http
      .post(ApiEndpoints.auth.resetPassword(), { token, newPassword }, { responseType: 'text' })
      .pipe(
        map(() => true)
      );
  }

  getUserInfo(): any {
    return this.userInfo;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
