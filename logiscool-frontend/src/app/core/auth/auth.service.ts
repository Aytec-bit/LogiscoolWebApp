import { Injectable } from '@angular/core';
import { keycloak } from './keycloak.init';

@Injectable({ providedIn: 'root' })
export class AuthService {

  isLoggedIn(): boolean {
    return !!keycloak.authenticated;
  }

  getToken(): string | undefined {
    return keycloak.token;
  }

  getUserRoles(): string[] {
    return keycloak.realmAccess?.roles ?? [];
  }

  getUserId(): string | undefined {
    return keycloak.subject;
  }

  login(): Promise<void> {
    return keycloak.login();
  }

  logout(): Promise<void> {
    return keycloak.logout({ redirectUri: window.location.origin });
  }
}
