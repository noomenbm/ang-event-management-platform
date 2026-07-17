import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Booking } from '../models';

export type BookingCreatePayload = Omit<Booking, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private readonly http = inject(HttpClient);

  getBookingsByUser(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API_BASE_URL}/bookings?userId=${userId}`);
  }

  createBooking(booking: BookingCreatePayload): Observable<Booking> {
    return this.http.post<Booking>(`${API_BASE_URL}/bookings`, booking);
  }

  cancelBooking(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${API_BASE_URL}/bookings/${id}`, {
      status: 'cancelled'
    });
  }
}
