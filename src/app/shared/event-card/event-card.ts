import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Event } from '../../models';
import { getLowestTicketPrice } from '../event-discovery';
import { EVENT_IMAGE_FALLBACK } from '../event-images';

@Component({
  selector: 'app-event-card',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCard {
  @Input({ required: true }) event!: Event;
  @Input() isFavorite = false;

  @Output() favoriteToggled = new EventEmitter<string>();

  get lowestTicketPrice(): number | null {
    return getLowestTicketPrice(this.event);
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

  get favoriteLabel(): string {
    const action = this.isFavorite ? 'Remove' : 'Add';

    return `${action} ${this.event.title} ${this.isFavorite ? 'from' : 'to'} favorites`;
  }

  toggleFavorite(): void {
    this.favoriteToggled.emit(this.event.id);
  }

  useFallbackImage(imageEvent: globalThis.Event): void {
    const image = imageEvent.target as HTMLImageElement;

    if (image.src.endsWith(EVENT_IMAGE_FALLBACK)) {
      return;
    }

    image.src = EVENT_IMAGE_FALLBACK;
  }
}
