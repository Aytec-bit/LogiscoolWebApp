import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { EventResponse, EventFilterOptions } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
})
export class EventListComponent implements OnInit {
  allEvents: EventResponse[] = [];
  filteredEvents: EventResponse[] = [];
  filterOptions: EventFilterOptions = { locations: [], types: [], targetAges: [] };

  loading = true;
  error: string | null = null;

  // Filters
  searchText = '';
  selectedLocation = '';
  selectedType = '';
  selectedTargetAge = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.allEvents = data;
        this.filterOptions = this.eventService.computeFilterOptions(data);
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les événements.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredEvents = this.eventService.applyFilters(
      this.allEvents,
      this.searchText,
      this.selectedLocation,
      this.selectedType,
      this.selectedTargetAge
    );
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedLocation = '';
    this.selectedType = '';
    this.selectedTargetAge = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText || this.selectedLocation || this.selectedType || this.selectedTargetAge);
  }
}
