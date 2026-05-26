import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { EventResponse } from '../../../core/models/event.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: EventResponse | null = null;
  loading = true;
  error: string | null = null;
  reservationSuccess = false;
  reservationError: string | null = null;
  reserving = false;

  private destroy$ = new Subject<void>();
  private eventId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = raw ? parseInt(raw, 10) : NaN;
    if (isNaN(id) || id <= 0) {
      this.error = "Identifiant d'événement invalide.";
      this.loading = false;
      return;
    }
    this.eventId = id;
    this.loadEvent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvent(silent = false): void {
    if (!this.eventId) return;
    if (!silent) this.loading = true;

    this.http
      .get<EventResponse>(`${environment.apiUrl}/api/events/${this.eventId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.event = data;
          this.loading = false;
        },
        error: (err) => {
          if (!silent) {
            this.error =
              err.status === 404
                ? "Cet événement n'existe pas."
                : "Impossible de charger l'événement.";
            this.loading = false;
          }
        },
      });
  }

  reserve(): void {
    if (!this.event || this.reserving) return;
    this.reserving = true;
    this.reservationSuccess = false;
    this.reservationError = null;

    this.http
      .post(`${environment.apiUrl}/api/reservations`, { eventId: this.event.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.reservationSuccess = true;
          this.reserving = false;
          this.loadEvent(true); // silent reload to update seat count
        },
        error: (err) => {
          if (err.status === 401) {
            this.authService.login();
          } else if (err.status === 409) {
            this.reservationError =
              err.error?.message ||
              'Vous avez déjà réservé cet événement ou il est complet.';
          } else if (err.status === 400) {
            this.reservationError =
              err.error?.message ||
              "La réservation est impossible (l'événement est peut-être passé).";
          } else {
            this.reservationError = 'La réservation a échoué. Veuillez réessayer.';
          }
          this.reserving = false;
        },
      });
  }
}
