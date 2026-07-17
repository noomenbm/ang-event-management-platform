import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../config/api.config';
import { Booking } from '../models';
import { BookingCreatePayload, BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let httpTesting: HttpTestingController;
  let service: BookingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingsService, provideHttpClient(), provideHttpClientTesting()]
    });

    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(BookingsService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('gets bookings for a user from the expected endpoint', () => {
    service.getBookingsByUser('user1').subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/bookings?userId=user1`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('posts a new booking to the expected endpoint', () => {
    const payload = createPayload();

    service.createBooking(payload).subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/bookings`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: '3', ...payload });
  });

  it('patches a booking cancellation to the expected endpoint', () => {
    service.cancelBooking('1').subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/bookings/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'cancelled' });
    request.flush({ id: '1', ...createPayload(), status: 'cancelled' });
  });
});

function createPayload(): BookingCreatePayload {
  return {
    userId: 'user1',
    eventId: '1',
    eventTitle: 'Angular Summit',
    eventDate: '2026-07-14',
    tickets: [{ type: 'General', quantity: 1, price: 99 }],
    attendees: [{ name: 'Jordan Lee', email: 'jordan@example.com', phone: '4165550101' }],
    totalAmount: 99,
    status: 'confirmed',
    bookingDate: '2026-07-17',
    referenceNumber: 'BK-2026-ABC123'
  };
}
