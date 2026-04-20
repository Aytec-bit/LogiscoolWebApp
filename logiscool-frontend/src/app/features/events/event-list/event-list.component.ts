import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  selector: 'app-event-list',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  templateUrl: './event-list.component.html',
})
export class EventListComponent implements OnInit {
  events: EventResponse[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.http.get<EventResponse[]>('http://localhost:8090/api/events').subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger les événements.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  login(): void {
    this.authService.login();
  }
}
