import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { WritableSignal } from '@angular/core';

import { Booking as CreatedBooking, Event } from '../../models';
import { BookingCreatePayload, BookingsService } from '../../services/bookings.service';
import { EventsService } from '../../services/events.service';
import { Booking } from './booking';

interface BookingTestApi {
  attendees: FormArray<FormGroup>;
  currentStep: WritableSignal<1 | 2 | 3>;
  confirmBooking(): void;
  continueToAttendees(): void;
  continueToSummary(): void;
  updateQuantity(ticketId: string, value: string, available: number): void;
}

describe('Booking', () => {
  const event = createEvent();
  let createBookingCalls: number;
  let createBookingSubject: Subject<CreatedBooking>;

  beforeEach(async () => {
    createBookingCalls = 0;
    createBookingSubject = new Subject<CreatedBooking>();

    await TestBed.configureTestingModule({
      imports: [Booking],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map([['eventId', event.id]])
            }
          }
        },
        {
          provide: EventsService,
          useValue: {
            getEventById: () => of(event)
          }
        },
        {
          provide: BookingsService,
          useValue: {
            createBooking: (payload: BookingCreatePayload) => {
              expect(payload.totalAmount).toBe(99);
              createBookingCalls += 1;
              return createBookingSubject.asObservable();
            }
          }
        }
      ]
    }).compileComponents();
  });

  it('creates attendee forms for the selected ticket quantity', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '2', 100);
    component.updateQuantity('vip', '1', 5);
    component.continueToAttendees();

    expect(component.attendees.length).toBe(3);
    expect(component.currentStep()).toBe(2);
  });

  it('prevents Step 3 progression when attendee details are invalid', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    component.continueToSummary();

    expect(component.currentStep()).toBe(2);
    expect(component.attendees.at(0).touched).toBe(true);
  });

  it('prevents duplicate booking submission while confirming', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    component.attendees.at(0).setValue({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '4165550101'
    });
    component.continueToSummary();

    component.confirmBooking();
    component.confirmBooking();

    expect(createBookingCalls).toBe(1);
  });
});

function createEvent(): Event {
  return {
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
      { id: 'vip', name: 'VIP', price: 199, available: 5 }
    ]
  };
}
