import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Event } from '../../models';
import { EventsService } from '../../services/events.service';
import { FavoriteEventsService } from '../../services/favorite-events.service';
import {
  CategoryFilter,
  DateFilter,
  DEFAULT_EVENT_DISCOVERY_CONTROLS,
  discoverEvents,
  PriceFilter,
  SortOption
} from '../../shared/event-discovery';
import { isEventUpcoming } from '../../shared/date-utils';
import { EventCard } from '../../shared/event-card/event-card';

@Component({
  selector: 'app-events',
  imports: [EventCard, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly eventsService = inject(EventsService);
  private readonly favoriteEventsService = inject(FavoriteEventsService);

  protected readonly allEvents = signal<Event[]>([]);
  protected readonly categoryFilter = signal<CategoryFilter>(
    DEFAULT_EVENT_DISCOVERY_CONTROLS.category
  );
  protected readonly dateFilter = signal<DateFilter>(
    DEFAULT_EVENT_DISCOVERY_CONTROLS.date
  );
  protected readonly errorMessage = signal('');
  protected readonly availableEvents = computed(() =>
    this.allEvents().filter((event) => isEventUpcoming(event.date))
  );
  protected readonly favoriteIds = signal<ReadonlySet<string>>(
    this.favoriteEventsService.loadFavoriteIds()
  );
  protected readonly filteredEvents = computed(() =>
    discoverEvents(this.allEvents(), {
      searchTerm: this.searchTerm(),
      category: this.categoryFilter(),
      date: this.dateFilter(),
      price: this.priceFilter(),
      sort: this.sortOption()
    })
  );
  protected readonly hasActiveControls = computed(
    () =>
      this.searchTerm() !== DEFAULT_EVENT_DISCOVERY_CONTROLS.searchTerm ||
      this.categoryFilter() !== DEFAULT_EVENT_DISCOVERY_CONTROLS.category ||
      this.dateFilter() !== DEFAULT_EVENT_DISCOVERY_CONTROLS.date ||
      this.priceFilter() !== DEFAULT_EVENT_DISCOVERY_CONTROLS.price ||
      this.sortOption() !== DEFAULT_EVENT_DISCOVERY_CONTROLS.sort
  );
  protected readonly isLoading = signal(false);
  protected readonly priceFilter = signal<PriceFilter>(
    DEFAULT_EVENT_DISCOVERY_CONTROLS.price
  );
  protected readonly resultCountLabel = computed(() => {
    const count = this.filteredEvents().length;

    return `${count} ${count === 1 ? 'event' : 'events'} found`;
  });
  protected readonly searchTerm = signal(DEFAULT_EVENT_DISCOVERY_CONTROLS.searchTerm);
  protected readonly sortOption = signal<SortOption>(
    DEFAULT_EVENT_DISCOVERY_CONTROLS.sort
  );
  protected readonly uniqueCategories = computed(() =>
    [...new Set(this.availableEvents().map((event) => event.category))].sort()
  );

  ngOnInit(): void {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventsService
      .getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.allEvents.set(events);
          this.isLoading.set(false);
        },
        error: () => {
          this.allEvents.set([]);
          this.errorMessage.set('Events could not be loaded. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  protected resetFilters(): void {
    this.searchTerm.set(DEFAULT_EVENT_DISCOVERY_CONTROLS.searchTerm);
    this.categoryFilter.set(DEFAULT_EVENT_DISCOVERY_CONTROLS.category);
    this.dateFilter.set(DEFAULT_EVENT_DISCOVERY_CONTROLS.date);
    this.priceFilter.set(DEFAULT_EVENT_DISCOVERY_CONTROLS.price);
    this.sortOption.set(DEFAULT_EVENT_DISCOVERY_CONTROLS.sort);
  }

  protected toggleFavorite(eventId: string): void {
    this.favoriteIds.set(
      this.favoriteEventsService.toggleFavorite(this.favoriteIds(), eventId)
    );
  }
}
