import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { keycloak } from '../auth/keycloak.init';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!req.url.includes('/api/') || !authService.isLoggedIn()) {
    return next(req);
  }

  // Essaie de rafraîchir le token si nécessaire.
  // En cas d'échec du refresh, on continue avec le token actuel (ou sans token) :
  // le serveur renverra 401, et les composants gèreront le login de façon explicite.
  // On ne redirige JAMAIS automatiquement ici pour ne pas casser l'affichage des erreurs.
  const updateToken$ = from(
    keycloak.updateToken(30).catch(() => false)
  );

  return updateToken$.pipe(
    switchMap(() => {
      const token = authService.getToken();
      return next(
        token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req
      );
      // Les erreurs HTTP (400, 401, 403, 409, 500…) remontent aux composants — pas catchées ici
    })
  );
};
