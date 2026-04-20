import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

interface EventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  seat: number;
  date: string;
  lengthTime: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  events: EventResponse[] = [];
  loading = true;
  error: string | null = null;
  createError: string | null = null;
  createSuccess = false;
  submitting = false;

  newEvent: {
    title: string;
    description: string;
    location: string;
    seat: number | null;
    date: string;
    lengthTime: string;
  } = {
    title: '',
    description: '',
    location: '',
    seat: null,
    date: '',
    lengthTime: '',
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.getUserRoles().includes('ADMIN')) {
      this.router.navigate(['/forbidden']);
      return;
    }
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.http.get<EventResponse[]>('http://localhost:8090/api/events').subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les événements.';
        this.loading = false;
      },
    });
  }

  createEvent(): void {
    this.createError = null;
    this.createSuccess = false;

    if (
      !this.newEvent.title.trim() ||
      !this.newEvent.description.trim() ||
      !this.newEvent.location.trim() ||
      this.newEvent.seat === null ||
      this.newEvent.seat <= 0 ||
      !this.newEvent.date ||
      !this.newEvent.lengthTime
    ) {
      this.createError = 'Tous les champs sont obligatoires et le nombre de places doit être positif.';
      return;
    }

    this.submitting = true;
    const body = {
      title: this.newEvent.title.trim(),
      description: this.newEvent.description.trim(),
      location: this.newEvent.location.trim(),
      seat: this.newEvent.seat,
      date: this.newEvent.date + ':00',       // datetime-local → ajoute les secondes
      lengthTime: this.newEvent.lengthTime + ':00', // time → ajoute les secondes
    };

    this.http.post<EventResponse>('http://localhost:8090/api/events', body).subscribe({
      next: (created) => {
        this.events.push(created);
        this.createSuccess = true;
        this.submitting = false;
        this.newEvent = { title: '', description: '', location: '', seat: null, date: '', lengthTime: '' };
      },
      error: () => {
        this.createError = "La création de l'événement a échoué.";
        this.submitting = false;
      },
    });
  }

  deleteEvent(id: number): void {
    this.http.delete(`http://localhost:8090/api/events/${id}`).subscribe({
      next: () => {
        this.events = this.events.filter((e) => e.id !== id);
      },
      error: () => {
        this.error = "Impossible de supprimer l'événement.";
      },
    });
  }
}
