import { BookingTicket, Event } from '../../models';

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
