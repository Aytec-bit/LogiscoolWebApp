import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .forbidden-container {
      max-width: 480px;
      margin: 5rem auto;
      padding: 2rem;
      text-align: center;
    }
    h1 { font-size: 1.5rem; margin-bottom: .75rem; color: #1E293B; }
    p  { color: #64748B; margin-bottom: 2rem; line-height: 1.6; }
  `],
  template: `
    <div class="forbidden-container">
      <h1>Accès refusé</h1>
      <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
    </div>
  `,
})
export class ForbiddenComponent {}
