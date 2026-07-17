import { Booking } from '../../models';
import {
  canCancelBooking,
  filterBookings,
  isPastBooking,
  isUpcomingBooking,
  replaceBooking
} from './my-bookings.helpers';

const today = new Date(2026, 6, 17);

describe('my bookings helpers', () => {
  it('classifies upcoming and past bookings using local dates', () => {
    expect(isUpcomingBooking(createBooking('1', '2026-07-17'), today)).toBe(true);
    expect(isPastBooking(createBooking('2', '2026-07-16'), today)).toBe(true);
  });

  it('allows cancellation only for upcoming confirmed bookings', () => {
    expect(canCancelBooking(createBooking('1', '2026-07-17'), today)).toBe(true);
    expect(canCancelBooking(createBooking('2', '2026-07-16'), today)).toBe(false);
    expect(
      canCancelBooking(createBooking('3', '2026-07-17', 'cancelled'), today)
    ).toBe(false);
  });

  it('filters bookings by date section', () => {
    const bookings = [
      createBooking('1', '2026-07-17'),
      createBooking('2', '2026-07-16')
    ];

    expect(filterBookings(bookings, 'upcoming', today).map((booking) => booking.id)).toEqual(['1']);
    expect(filterBookings(bookings, 'past', today).map((booking) => booking.id)).toEqual(['2']);
  });

  it('replaces an updated booking in the local list', () => {
    const bookings = [createBooking('1', '2026-07-17')];
    const updated = createBooking('1', '2026-07-17', 'cancelled');

    expect(replaceBooking(bookings, updated)[0].status).toBe('cancelled');
  });
});

function createBooking(
  id: string,
  eventDate: string,
  status: Booking['status'] = 'confirmed'
): Booking {
  return {
    id,
    userId: 'user1',
    eventId: '1',
    eventTitle: 'Angular Summit',
    eventDate,
    tickets: [{ type: 'General', quantity: 1, price: 99 }],
    attendees: [{ name: 'Jordan Lee', email: 'jordan@example.com', phone: '4165550101' }],
    totalAmount: 99,
    status,
    bookingDate: '2026-07-01',
    referenceNumber: `BK-${id}`
  };
}
