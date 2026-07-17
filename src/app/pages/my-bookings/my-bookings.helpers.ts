import { Booking } from '../../models';

export type BookingFilter = 'all' | 'upcoming' | 'past';

export function isUpcomingBooking(booking: Booking, today = new Date()): boolean {
  return parseDateOnly(booking.eventDate).getTime() >= startOfDay(today).getTime();
}

export function isPastBooking(booking: Booking, today = new Date()): boolean {
  return parseDateOnly(booking.eventDate).getTime() < startOfDay(today).getTime();
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

function parseDateOnly(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
