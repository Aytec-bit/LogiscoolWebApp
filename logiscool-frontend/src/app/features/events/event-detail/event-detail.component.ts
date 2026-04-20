import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf, DatePipe } from '@angular/common';
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
  selector: 'app-event-detail',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent implements OnInit {
  event: EventResponse | null = null;
  loading = true;
  error: string | null = null;
  reservationSuccess = false;
  reservationError: string | null = null;
  reserving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<EventResponse>(`http://localhost:8090/api/events/${id}`).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.status === 404
          ? "Cet événement n'existe pas."
          : "Impossible de charger l'événement.";
        this.loading = false;
      },
    });
  }

  reserve(): void {
    if (!this.event) return;
    this.reserving = true;
    this.reservationSuccess = false;
    this.reservationError = null;

    this.http.post('http://localhost:8090/api/reservations', { eventId: this.event.id }).subscribe({
      next: () => {
        this.reservationSuccess = true;
        this.reserving = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.login();
        } else {
          this.reservationError = 'La réservation a échoué. Veuillez réessayer.';
        }
        this.reserving = false;
      },
    });
  }
}
