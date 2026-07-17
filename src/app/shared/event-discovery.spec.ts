import { Event } from '../models';
import {
  DEFAULT_EVENT_DISCOVERY_CONTROLS,
  discoverEvents,
  getLowestTicketPrice
} from './event-discovery';

const events: Event[] = [
  createEvent('1', 'Angular Summit', 'Technology', '2026-07-14', [
    99,
    45
  ]),
  createEvent('2', 'Summer Sounds', 'Music', '2026-07-17', [25, 35]),
  createEvent('3', 'Community Coding Workshop', 'Community', '2026-07-19', [
    0
  ]),
  createEvent('4', 'Downtown 10K Run', 'Sports', '2026-07-25', [50]),
  createEvent('5', 'Past Gallery Opening', 'Arts', '2026-05-22', [25])
];

describe('event discovery', () => {
  const today = new Date(2026, 6, 17);

  it('searches by title without changing the source list', () => {
    const result = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        searchTerm: ' angular '
      },
      today
    );

    expect(result.map((event) => event.id)).toEqual(['1']);
    expect(events.map((event) => event.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('filters by category', () => {
    const result = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        category: 'Music'
      },
      today
    );

    expect(result.map((event) => event.id)).toEqual(['2']);
  });

  it('filters by date range', () => {
    const upcoming = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        date: 'upcoming'
      },
      today
    );
    const thisWeek = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        date: 'this-week'
      },
      today
    );
    const thisMonth = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        date: 'this-month'
      },
      today
    );

    expect(upcoming.map((event) => event.id)).toEqual(['2', '3', '4']);
    expect(thisWeek.map((event) => event.id)).toEqual(['1', '2']);
    expect(thisMonth.map((event) => event.id)).toEqual(['1', '2', '3', '4']);
  });

  it('filters by lowest ticket price', () => {
    const free = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        price: 'free'
      },
      today
    );
    const under50 = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        price: 'under-50'
      },
      today
    );
    const fiftyPlus = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        price: '50-plus'
      },
      today
    );

    expect(free.map((event) => event.id)).toEqual(['3']);
    expect(under50.map((event) => event.id)).toEqual(['5', '1', '2']);
    expect(fiftyPlus.map((event) => event.id)).toEqual(['4']);
  });

  it('sorts by date or lowest ticket price', () => {
    const latest = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        sort: 'date-latest'
      },
      today
    );
    const priceLow = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        sort: 'price-low'
      },
      today
    );
    const priceHigh = discoverEvents(
      events,
      {
        ...DEFAULT_EVENT_DISCOVERY_CONTROLS,
        sort: 'price-high'
      },
      today
    );

    expect(latest.map((event) => event.id)).toEqual(['4', '3', '2', '1', '5']);
    expect(priceLow.map((event) => event.id)).toEqual(['3', '2', '5', '1', '4']);
    expect(priceHigh.map((event) => event.id)).toEqual(['4', '1', '2', '5', '3']);
  });

  it('calculates the lowest ticket price', () => {
    expect(getLowestTicketPrice(events[0])).toBe(45);
  });
});

function createEvent(
  id: string,
  title: string,
  category: string,
  date: string,
  prices: number[]
): Event {
  return {
    id,
    title,
    description: '',
    category,
    date,
    time: '09:00 AM',
    location: 'Toronto, ON',
    venue: 'Test Venue',
    image: '/favicon.ico',
    organizerName: 'Test Organizer',
    ticketTypes: prices.map((price, index) => ({
      id: String(index + 1),
      name: 'General',
      price,
      available: 10
    }))
  };
}
