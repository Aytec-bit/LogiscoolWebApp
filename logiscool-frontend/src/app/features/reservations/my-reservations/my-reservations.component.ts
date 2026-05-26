import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface EventSummary {
  id: number;
  title: string;
  date: string;
  location: string;
}

interface ReservationResponse {
  id: number;
  userId: string;
  event: EventSummary;
  reservationDate: string;
  status: string;
}

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.scss',
})
export class MyReservationsComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.http.get<ReservationResponse[]>(`${environment.apiUrl}/api/reservations/my`).subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos réservations.';
        this.loading = false;
      },
    });
  }

  cancel(id: number): void {
    this.http.delete(`${environment.apiUrl}/api/reservations/${id}`).subscribe({
      next: () => this.load(),
      error: () => {
        this.error = "Impossible d'annuler la réservation.";
      },
    });
  }
}
