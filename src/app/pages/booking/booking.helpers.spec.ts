import { Event } from '../../models';
import {
  buildAttendeeSlots,
  buildBookingCreatePayload,
  buildBookingTickets,
  clampQuantity,
  effectiveTicketMaximum,
  generateBookingReference,
  hasSelectedTicket,
  ticketLimitMessage,
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
    expect(clampQuantity(1, 0)).toBe(0);
  });

  it('calculates the effective ticket maximum from availability and booking cap', () => {
    expect(effectiveTicketMaximum(300)).toBe(10);
    expect(effectiveTicketMaximum(7)).toBe(7);
    expect(effectiveTicketMaximum(0)).toBe(0);
  });

  it('describes ticket limits from the effective maximum', () => {
    expect(ticketLimitMessage(300)).toBe('Up to 10 tickets per booking');
    expect(ticketLimitMessage(7)).toBe('Up to 7 tickets available');
    expect(ticketLimitMessage(0)).toBe('Sold out');
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

  it('generates a readable booking reference number', () => {
    const reference = generateBookingReference(new Date(2026, 6, 17));

    expect(reference).toMatch(/^BK-2026-[A-Z0-9]{7}$/);
  });

  it('builds a booking payload with matching totals and attendees', () => {
    const tickets = [
      { type: 'General', quantity: 2, price: 99 },
      { type: 'VIP', quantity: 1, price: 199 }
    ];
    const attendees = [
      { name: 'Jordan Lee', email: 'jordan@example.com', phone: '4165550101' },
      { name: 'Avery Kim', email: 'avery@example.com', phone: '4165550102' },
      { name: 'Morgan Chan', email: 'morgan@example.com', phone: '4165550103' }
    ];

    const payload = buildBookingCreatePayload(
      event,
      tickets,
      attendees,
      'BK-2026-ABC123',
      '2026-07-17'
    );

    expect(payload.tickets).toEqual(tickets);
    expect(payload.attendees.length).toBe(3);
    expect(payload.totalAmount).toBe(397);
    expect(payload.referenceNumber).toBe('BK-2026-ABC123');
  });
});
