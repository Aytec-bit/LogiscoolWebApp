import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'logiscool',
  clientId: 'logiscool-angular',
});

export function initializeKeycloak(): () => Promise<boolean> {
  return (): Promise<boolean> =>
    keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
    });
}
