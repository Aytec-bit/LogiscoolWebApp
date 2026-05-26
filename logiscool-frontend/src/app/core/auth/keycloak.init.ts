import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

export const keycloak = new Keycloak({
  url: environment.keycloakUrl,
  realm: environment.keycloakRealm,
  clientId: environment.keycloakClientId,
});

export function initializeKeycloak(): () => Promise<boolean> {
  return (): Promise<boolean> =>
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      })
      .catch(() => false);
}
