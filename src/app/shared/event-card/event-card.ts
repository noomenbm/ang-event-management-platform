import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Event } from '../../models';

@Component({
  selector: 'app-event-card',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCard {
  @Input({ required: true }) event!: Event;

  get lowestTicketPrice(): number | null {
    if (this.event.ticketTypes.length === 0) {
      return null;
    }

    return Math.min(...this.event.ticketTypes.map((ticket) => ticket.price));
  }

  get priceLabel(): string {
    const price = this.lowestTicketPrice;

    if (price === null) {
      return 'Price unavailable';
    }

    if (price === 0) {
      return 'Free';
    }

    return 'From';
  }
}
