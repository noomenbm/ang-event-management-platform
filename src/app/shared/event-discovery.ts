import { Event } from '../models';

export type CategoryFilter = 'all' | string;
export type DateFilter = 'all' | 'upcoming' | 'this-week' | 'this-month';
export type PriceFilter = 'all' | 'free' | 'under-50' | '50-plus';
export type SortOption =
  | 'date-soonest'
  | 'date-latest'
  | 'price-low'
  | 'price-high';

export interface EventDiscoveryControls {
  searchTerm: string;
  category: CategoryFilter;
  date: DateFilter;
  price: PriceFilter;
  sort: SortOption;
}

export const DEFAULT_EVENT_DISCOVERY_CONTROLS: EventDiscoveryControls = {
  searchTerm: '',
  category: 'all',
  date: 'all',
  price: 'all',
  sort: 'date-soonest'
};

export function getLowestTicketPrice(event: Event): number | null {
  if (event.ticketTypes.length === 0) {
    return null;
  }

  return Math.min(...event.ticketTypes.map((ticket) => ticket.price));
}

export function discoverEvents(
  events: Event[],
  controls: EventDiscoveryControls,
  today = new Date()
): Event[] {
  const searchTerm = controls.searchTerm.trim().toLowerCase();

  const filteredEvents = events
    .filter((event) => event.title.toLowerCase().includes(searchTerm))
    .filter((event) => categoryMatches(event, controls.category))
    .filter((event) => dateMatches(event, controls.date, today))
    .filter((event) => priceMatches(event, controls.price));

  return [...filteredEvents].sort((first, second) =>
    compareEvents(first, second, controls.sort)
  );
}

export function eventDateValue(event: Event): number {
  return parseDateOnly(event.date).getTime();
}

function categoryMatches(event: Event, category: CategoryFilter): boolean {
  return category === 'all' || event.category === category;
}

function dateMatches(event: Event, dateFilter: DateFilter, today: Date): boolean {
  if (dateFilter === 'all') {
    return true;
  }

  const eventDate = parseDateOnly(event.date);
  const currentDate = startOfDay(today);

  if (dateFilter === 'upcoming') {
    return eventDate.getTime() >= currentDate.getTime();
  }

  if (dateFilter === 'this-month') {
    return (
      eventDate.getFullYear() === currentDate.getFullYear() &&
      eventDate.getMonth() === currentDate.getMonth()
    );
  }

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  return eventDate >= weekStart && eventDate <= weekEnd;
}

function priceMatches(event: Event, priceFilter: PriceFilter): boolean {
  if (priceFilter === 'all') {
    return true;
  }

  const lowestPrice = getLowestTicketPrice(event);

  if (lowestPrice === null) {
    return false;
  }

  if (priceFilter === 'free') {
    return lowestPrice === 0;
  }

  if (priceFilter === 'under-50') {
    return lowestPrice > 0 && lowestPrice < 50;
  }

  return lowestPrice >= 50;
}

function compareEvents(first: Event, second: Event, sort: SortOption): number {
  if (sort === 'date-latest') {
    return eventDateValue(second) - eventDateValue(first);
  }

  if (sort === 'price-low') {
    return priceValue(first) - priceValue(second);
  }

  if (sort === 'price-high') {
    return priceValue(second) - priceValue(first);
  }

  return eventDateValue(first) - eventDateValue(second);
}

function priceValue(event: Event): number {
  return getLowestTicketPrice(event) ?? Number.MAX_SAFE_INTEGER;
}

function parseDateOnly(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const weekStart = startOfDay(date);
  weekStart.setDate(date.getDate() - date.getDay());

  return weekStart;
}

function endOfWeek(date: Date): Date {
  const weekEnd = startOfWeek(date);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return weekEnd;
}
