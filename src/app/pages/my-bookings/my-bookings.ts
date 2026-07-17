import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, HostListener, computed, inject, OnInit, signal } from '@angular/core';

import { Booking } from '../../models';
import { BookingsService } from '../../services/bookings.service';
import {
  BookingFilter,
  canCancelBooking,
  filterBookings,
  replaceBooking
} from './my-bookings.helpers';

@Component({
  selector: 'app-my-bookings',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly userId = 'user1';

  protected readonly bookingToCancel = signal<Booking | null>(null);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly filteredBookings = computed(() =>
    filterBookings(this.bookings(), this.selectedFilter())
  );
  protected readonly isCancelling = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly notificationMessage = signal('');
  protected readonly notificationType = signal<'success' | 'error'>('success');
  protected readonly selectedFilter = signal<BookingFilter>('all');

  ngOnInit(): void {
    this.loadBookings();
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    this.closeCancellation();
  }

  protected loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.bookingsService.getBookingsByUser(this.userId).subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Your bookings could not be loaded.');
        this.isLoading.set(false);
      }
    });
  }

  protected setFilter(filter: BookingFilter): void {
    this.selectedFilter.set(filter);
  }

  protected totalTickets(booking: Booking): number {
    return booking.tickets.reduce((total, ticket) => total + ticket.quantity, 0);
  }

  protected canCancel(booking: Booking): boolean {
    return canCancelBooking(booking);
  }

  protected emptyMessage(): string {
    if (this.selectedFilter() === 'upcoming') {
      return 'No upcoming bookings';
    }

    if (this.selectedFilter() === 'past') {
      return 'No past bookings';
    }

    return 'No bookings found';
  }

  protected requestCancellation(booking: Booking): void {
    if (!this.canCancel(booking)) {
      return;
    }

    this.bookingToCancel.set(booking);
    this.notificationMessage.set('');
  }

  protected closeCancellation(): void {
    if (!this.isCancelling()) {
      this.bookingToCancel.set(null);
    }
  }

  protected confirmCancellation(): void {
    const booking = this.bookingToCancel();

    if (!booking || !this.canCancel(booking) || this.isCancelling()) {
      return;
    }

    this.isCancelling.set(true);
    this.notificationMessage.set('');

    this.bookingsService.cancelBooking(booking.id).subscribe({
      next: (updatedBooking) => {
        this.bookings.set(replaceBooking(this.bookings(), updatedBooking));
        this.notificationType.set('success');
        this.notificationMessage.set('Booking successfully cancelled.');
        this.isCancelling.set(false);
        this.bookingToCancel.set(null);
      },
      error: () => {
        this.notificationType.set('error');
        this.notificationMessage.set('Cancellation failed. Please try again.');
        this.isCancelling.set(false);
      }
    });
  }
}
