import { Component, inject, OnInit, signal } from '@angular/core';

import { Event } from '../../models';
import { EventsService } from '../../services/events.service';
import { EventCard } from '../../shared/event-card/event-card';

@Component({
  selector: 'app-events',
  imports: [EventCard],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {
  private readonly eventsService = inject(EventsService);

  protected readonly events = signal<Event[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventsService.getEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.errorMessage.set('Events could not be loaded. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
