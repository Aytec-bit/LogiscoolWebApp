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

  // Rafraîchit le token si nécessaire.
  // On gère l'échec du refresh DANS la Promise (avant conversion en Observable)
  // pour ne pas intercepter les erreurs HTTP (4xx/5xx) qui doivent
  // remonter normalement jusqu'aux composants.
  const updateToken$ = from(
    keycloak.updateToken(30).catch(() => {
      authService.login(); // redirige vers Keycloak, la page est déchargée
    })
  );

  return updateToken$.pipe(
    switchMap(() => {
      const token = authService.getToken();
      return next(
        token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req
      );
      // Les erreurs HTTP (400, 403, 404, 500…) remontent aux composants — pas catchées ici
    })
  );
};
