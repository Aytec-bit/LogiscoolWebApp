import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { EventResponse, EventFilterOptions } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  /** Load all events (no filter) */
  getAll(): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(this.apiUrl);
  }

  /** Load events with optional backend filters */
  getFiltered(location?: string, type?: string, targetAge?: string): Observable<EventResponse[]> {
    let params = new HttpParams();
    if (location) params = params.set('location', location);
    if (type)     params = params.set('type', type);
    if (targetAge) params = params.set('targetAge', targetAge);
    return this.http.get<EventResponse[]>(this.apiUrl, { params });
  }

  /** Get distinct values for filter dropdowns */
  getFilterOptions(): Observable<EventFilterOptions> {
    return this.http.get<EventFilterOptions>(`${this.apiUrl}/filter-options`);
  }

  /** Get a single event by id */
  getById(id: number): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/${id}`);
  }

  /** Compute distinct filter options from an in-memory event list */
  computeFilterOptions(events: EventResponse[]): EventFilterOptions {
    const distinct = <T>(arr: (T | null | undefined)[]): T[] =>
      [...new Set(arr.filter((v): v is T => v != null && v !== ''))].sort() as T[];
    return {
      locations: distinct(events.map(e => e.location)),
      types: distinct(events.map(e => e.type)),
      targetAges: distinct(events.map(e => e.targetAge)),
    };
  }

  /** Apply client-side filters (text search + dropdowns) to an event list */
  applyFilters(
    events: EventResponse[],
    searchText: string,
    location: string,
    type: string,
    targetAge: string
  ): EventResponse[] {
    const q = searchText.toLowerCase().trim();
    return events.filter(e => {
      const matchesText =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q);
      const matchesLocation = !location || e.location === location;
      const matchesType = !type || e.type === type;
      const matchesAge = !targetAge || e.targetAge === targetAge;
      return matchesText && matchesLocation && matchesType && matchesAge;
    });
  }
}
