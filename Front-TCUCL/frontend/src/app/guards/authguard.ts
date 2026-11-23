import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  if (token && !authService.isTokenExpired(token)) {
    if (!authService.isAuthenticated()) {
      authService.isAuthenticated.set(true);
      const storedUser = localStorage.getItem('user_info');
      if (storedUser && !authService.userInfo()) {
        try {
          authService.userInfo.set(JSON.parse(storedUser));
        } catch (e) {
          console.error('Erreur parsing user_info in authGuard', e);
        }
      }
    }
    return true;
  } else {
    authService.logout();
    return false;
  }
};
