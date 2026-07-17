import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Event } from '../../models';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-event-details',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetails implements OnInit {
  private readonly eventsService = inject(EventsService);
  private readonly route = inject(ActivatedRoute);

  protected readonly errorMessage = signal('');
  protected readonly event = signal<Event | null>(null);
  protected readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadEvent();
  }

  protected loadEvent(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.event.set(null);
      this.errorMessage.set('No event ID was provided.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
      },
      error: () => {
        this.event.set(null);
        this.errorMessage.set('Event details could not be loaded.');
        this.isLoading.set(false);
      }
    });
  }
}
