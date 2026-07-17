import { Attendee, BookingTicket, Event } from '../../models';
import { BookingCreatePayload } from '../../services/bookings.service';

export interface AttendeeSlot {
  ticketType: string;
  index: number;
}

export function clampQuantity(value: number, available: number): number {
  if (!Number.isInteger(value) || value < 0) {
    return 0;
  }

  return Math.min(value, Math.min(available, 10));
}

export function buildBookingTickets(
  event: Event,
  quantities: ReadonlyMap<string, number>
): BookingTicket[] {
  return event.ticketTypes
    .map((ticketType) => ({
      type: ticketType.name,
      quantity: quantities.get(ticketType.id) ?? 0,
      price: ticketType.price
    }))
    .filter((ticket) => ticket.quantity > 0);
}

export function totalTickets(tickets: BookingTicket[]): number {
  return tickets.reduce((total, ticket) => total + ticket.quantity, 0);
}

export function totalAmount(tickets: BookingTicket[]): number {
  return tickets.reduce(
    (total, ticket) => total + ticket.quantity * ticket.price,
    0
  );
}

export function hasSelectedTicket(tickets: BookingTicket[]): boolean {
  return totalTickets(tickets) > 0;
}

export function buildAttendeeSlots(tickets: BookingTicket[]): AttendeeSlot[] {
  return tickets.flatMap((ticket) =>
    Array.from({ length: ticket.quantity }, (_, index) => ({
      ticketType: ticket.type,
      index
    }))
  );
}

export function generateBookingReference(date = new Date()): string {
  const year = date.getFullYear();
  const timestamp = date.getTime().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);

  return `BK-${year}-${timestamp}${random}`;
}

export function bookingDateValue(date: Date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export function buildBookingCreatePayload(
  event: Event,
  tickets: BookingTicket[],
  attendees: Attendee[],
  referenceNumber: string,
  bookingDate: string
): BookingCreatePayload {
  return {
    userId: 'user1',
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    tickets,
    attendees,
    totalAmount: totalAmount(tickets),
    status: 'confirmed',
    bookingDate,
    referenceNumber
  };
}
