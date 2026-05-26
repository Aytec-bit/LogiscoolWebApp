import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { EventResponse } from '../../../core/models/event.model';
import { environment } from '../../../../environments/environment';

const PREDEFINED_TYPES = [
  'Scratch', 'Python', 'Web', 'Robotique', 'IA', 'JavaScript', 'Autre'
];

const PREDEFINED_AGES = [
  '6-8 ans', '9-11 ans', '12-14 ans', '15-17 ans', 'Adultes', 'Tous âges'
];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  events: EventResponse[] = [];
  loading = true;
  error: string | null = null;
  createError: string | null = null;
  createSuccess = false;
  submitting = false;
  editingEventId: number | null = null;

  readonly predefinedTypes = PREDEFINED_TYPES;
  readonly predefinedAges  = PREDEFINED_AGES;

  newEvent: {
    title: string;
    description: string;
    location: string;
    type: string;
    targetAge: string;
    seat: number | null;
    date: string;
    lengthTime: string;
    price: number | null;
  } = {
    title:       '',
    description: '',
    location:    '',
    type:        '',
    targetAge:   '',
    seat:        null,
    date:        '',
    lengthTime:  '',
    price:       null,
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
    this.http.get<EventResponse[]>(`${environment.apiUrl}/api/events`).subscribe({
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

  isFutureEvent(dateStr: string): boolean {
    return new Date(dateStr) > new Date();
  }

  startEdit(event: EventResponse): void {
    this.editingEventId = event.id;
    this.createError = null;
    this.createSuccess = false;
    this.newEvent = {
      title:       event.title,
      description: event.description,
      location:    event.location,
      type:        event.type ?? '',
      targetAge:   event.targetAge ?? '',
      seat:        event.seat,
      date:        event.date.substring(0, 16),
      lengthTime:  event.lengthTime.substring(0, 5),
      price:       event.price,
    };
  }

  cancelEdit(): void {
    this.editingEventId = null;
    this.createError    = null;
    this.createSuccess  = false;
    this.newEvent = {
      title: '', description: '', location: '', type: '', targetAge: '',
      seat: null, date: '', lengthTime: '', price: null,
    };
  }

  createEvent(): void {
    this.createError   = null;
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
      this.createError = 'Tous les champs obligatoires (*) doivent être remplis et le nombre de places doit être positif.';
      return;
    }

    if (this.newEvent.price !== null && this.newEvent.price < 0) {
      this.createError = 'Le prix ne peut pas être négatif.';
      return;
    }

    this.submitting = true;
    const body = {
      title:       this.newEvent.title.trim(),
      description: this.newEvent.description.trim(),
      location:    this.newEvent.location.trim(),
      type:        this.newEvent.type.trim() || null,
      targetAge:   this.newEvent.targetAge.trim() || null,
      seat:        this.newEvent.seat,
      date:        this.newEvent.date + ':00',
      lengthTime:  this.newEvent.lengthTime + ':00',
      price:       this.newEvent.price,
    };

    if (this.editingEventId !== null) {
      this.http.put<EventResponse>(`${environment.apiUrl}/api/events/${this.editingEventId}`, body).subscribe({
        next: (updated) => {
          this.events = this.events.map(e => e.id === updated.id ? updated : e);
          this.createSuccess  = true;
          this.submitting     = false;
          this.editingEventId = null;
          this.cancelEdit();
        },
        error: () => {
          this.createError = "La modification de l'événement a échoué.";
          this.submitting  = false;
        },
      });
    } else {
      this.http.post<EventResponse>(`${environment.apiUrl}/api/events`, body).subscribe({
        next: (created) => {
          this.events.push(created);
          this.createSuccess = true;
          this.submitting    = false;
          this.cancelEdit();
        },
        error: () => {
          this.createError = "La création de l'événement a échoué.";
          this.submitting  = false;
        },
      });
    }
  }

  deleteEvent(id: number): void {
    if (!confirm('Supprimer cet événement ? Cette action est irréversible.')) return;
    this.http.delete(`${environment.apiUrl}/api/events/${id}`).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
      },
      error: () => {
        this.error = "Impossible de supprimer l'événement.";
      },
    });
  }
}
