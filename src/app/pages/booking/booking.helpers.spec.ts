import { Event } from '../../models';
import {
  buildAttendeeSlots,
  buildBookingTickets,
  clampQuantity,
  hasSelectedTicket,
  totalAmount,
  totalTickets
} from './booking.helpers';

const event: Event = {
  id: '1',
  title: 'Angular Summit',
  description: '',
  category: 'Technology',
  date: '2026-07-14',
  time: '09:00 AM',
  location: 'Toronto, ON',
  venue: 'Test Venue',
  image: '/favicon.ico',
  organizerName: 'Test Organizer',
  ticketTypes: [
    { id: 'general', name: 'General', price: 99, available: 100 },
    { id: 'vip', name: 'VIP', price: 199, available: 3 }
  ]
};

describe('booking helpers', () => {
  it('calculates selected tickets, ticket count, and total amount', () => {
    const tickets = buildBookingTickets(
      event,
      new Map([
        ['general', 2],
        ['vip', 1]
      ])
    );

    expect(tickets).toEqual([
      { type: 'General', quantity: 2, price: 99 },
      { type: 'VIP', quantity: 1, price: 199 }
    ]);
    expect(totalTickets(tickets)).toBe(3);
    expect(totalAmount(tickets)).toBe(397);
  });

  it('validates at least one selected ticket', () => {
    expect(hasSelectedTicket([])).toBe(false);
    expect(hasSelectedTicket([{ type: 'General', quantity: 1, price: 99 }])).toBe(
      true
    );
  });

  it('clamps invalid, negative, unavailable, and high quantities', () => {
    expect(clampQuantity(-1, 100)).toBe(0);
    expect(clampQuantity(1.5, 100)).toBe(0);
    expect(clampQuantity(12, 100)).toBe(10);
    expect(clampQuantity(10, 3)).toBe(3);
  });

  it('creates one attendee slot per selected ticket', () => {
    const slots = buildAttendeeSlots([
      { type: 'General', quantity: 2, price: 99 },
      { type: 'VIP', quantity: 1, price: 199 }
    ]);

    expect(slots).toEqual([
      { ticketType: 'General', index: 0 },
      { ticketType: 'General', index: 1 },
      { ticketType: 'VIP', index: 0 }
    ]);
  });
});
