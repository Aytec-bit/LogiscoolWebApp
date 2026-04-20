import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="forbidden-container">
      <h1>403 — Accès refusé</h1>
      <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
    </div>
  `,
})
export class ForbiddenComponent {}
