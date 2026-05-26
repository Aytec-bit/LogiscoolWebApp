import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { EventService } from '../../../core/services/event.service';
import { EventResponse, EventFilterOptions } from '../../../core/models/event.model';

// Palette de couleurs par type d'atelier
const TYPE_COLORS: Record<string, string> = {
  'Scratch':    '#4f46e5',
  'Python':     '#16a34a',
  'Web':        '#d97706',
  'Robotique':  '#dc2626',
  'IA':         '#7c3aed',
  'JavaScript': '#ca8a04',
};

const DEFAULT_COLOR = '#0284c7';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [FullCalendarModule, FormsModule, RouterLink],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss',
})
export class EventCalendarComponent implements OnInit {
  allEvents: EventResponse[] = [];
  filterOptions: EventFilterOptions = { locations: [], types: [], targetAges: [] };

  loading = true;
  error: string | null = null;

  // Filtres
  searchText = '';
  selectedLocation = '';
  selectedType = '';
  selectedTargetAge = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    headerToolbar: {
      left:   'prev,next today',
      center: 'title',
      right:  'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week:  'Semaine',
      day:   'Jour',
    },
    height: 'auto',
    eventClick: (info: EventClickArg) => this.onEventClick(info),
    eventTimeFormat: {
      hour:   '2-digit',
      minute: '2-digit',
      meridiem: false,
    },
    dayMaxEvents: 3,
    events: [],
  };

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.allEvents = data;
        this.filterOptions = this.eventService.computeFilterOptions(data);
        this.updateCalendarEvents();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les événements.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.updateCalendarEvents();
  }

  resetFilters(): void {
    this.searchText      = '';
    this.selectedLocation = '';
    this.selectedType    = '';
    this.selectedTargetAge = '';
    this.updateCalendarEvents();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText || this.selectedLocation || this.selectedType || this.selectedTargetAge);
  }

  private updateCalendarEvents(): void {
    const filtered = this.eventService.applyFilters(
      this.allEvents,
      this.searchText,
      this.selectedLocation,
      this.selectedType,
      this.selectedTargetAge
    );

    const calEvents = filtered.map(e => ({
      id:          String(e.id),
      title:       e.title,
      start:       e.date,
      end:         this.computeEndDate(e.date, e.lengthTime),
      color:       e.type ? (TYPE_COLORS[e.type] ?? DEFAULT_COLOR) : DEFAULT_COLOR,
      extendedProps: {
        location:  e.location,
        type:      e.type,
        targetAge: e.targetAge,
        seat:      e.seat,
        price:     e.price,
      },
    }));

    // Update calendar events reactively
    this.calendarOptions = { ...this.calendarOptions, events: calEvents };
  }

  private computeEndDate(startDate: string, lengthTime: string): string | undefined {
    if (!lengthTime) return undefined;
    const start = new Date(startDate);
    const parts = lengthTime.split(':');
    start.setHours(start.getHours()   + Number(parts[0] || 0));
    start.setMinutes(start.getMinutes() + Number(parts[1] || 0));
    return start.toISOString();
  }

  getTypeColor(type: string): string {
    return TYPE_COLORS[type] ?? DEFAULT_COLOR;
  }

  private onEventClick(info: EventClickArg): void {
    const id = Number(info.event.id);
    if (id) {
      this.router.navigate(['/events', id]);
    }
  }
}
