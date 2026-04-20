import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { keycloak } from '../auth/keycloak.init';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/api/') && authService.isLoggedIn()) {
    return from(keycloak.updateToken(30)).pipe(
      switchMap(() => {
        const token = authService.getToken();
        if (token) {
          return next(req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }));
        }
        return next(req);
      }),
      catchError(() => {
        authService.login();
        return next(req);
      })
    );
  }

  return next(req);
};
