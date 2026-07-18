import { Booking } from '../../models';
import { isEventPast, isEventUpcoming } from '../../shared/date-utils';

export type BookingFilter = 'all' | 'upcoming' | 'past';

export function isUpcomingBooking(booking: Booking, today = new Date()): boolean {
  return isEventUpcoming(booking.eventDate, today);
}

export function isPastBooking(booking: Booking, today = new Date()): boolean {
  return isEventPast(booking.eventDate, today);
}

export function canCancelBooking(booking: Booking, today = new Date()): boolean {
  return booking.status === 'confirmed' && isUpcomingBooking(booking, today);
}

export function filterBookings(
  bookings: Booking[],
  filter: BookingFilter,
  today = new Date()
): Booking[] {
  if (filter === 'upcoming') {
    return bookings.filter((booking) => isUpcomingBooking(booking, today));
  }

  if (filter === 'past') {
    return bookings.filter((booking) => isPastBooking(booking, today));
  }

  return bookings;
}

export function replaceBooking(bookings: Booking[], updatedBooking: Booking): Booking[] {
  return bookings.map((booking) =>
    booking.id === updatedBooking.id ? updatedBooking : booking
  );
}
