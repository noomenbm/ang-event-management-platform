import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { WritableSignal } from '@angular/core';

import { Booking as CreatedBooking, Event } from '../../models';
import { BookingCreatePayload, BookingsService } from '../../services/bookings.service';
import { EventsService } from '../../services/events.service';
import { Booking } from './booking';

interface BookingTestApi {
  attendees: FormArray<FormGroup<AttendeeForm>>;
  currentStep: WritableSignal<1 | 2 | 3>;
  confirmBooking(): void;
  continueToAttendees(): void;
  continueToSummary(): void;
  ticketQuantity(ticketId: string): number;
  updateQuantity(ticketId: string, value: string, available: number): void;
}

interface AttendeeForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
}

describe('Booking', () => {
  let event: Event;
  let createBookingCalls: number;
  let createBookingSubject: Subject<CreatedBooking>;
  let lastPayload: BookingCreatePayload | null;

  beforeEach(async () => {
    event = createEvent('2026-12-14');
    createBookingCalls = 0;
    createBookingSubject = new Subject<CreatedBooking>();
    lastPayload = null;

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
              lastPayload = payload;
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

  it('shows quantity helper text and effective max values for each ticket type', () => {
    event.ticketTypes = [
      { id: 'general', name: 'General', price: 99, available: 100 },
      { id: 'vip', name: 'VIP', price: 199, available: 7 },
      { id: 'rush', name: 'Rush', price: 0, available: 0 }
    ];
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();

    const pageText = fixture.nativeElement.textContent as string;
    const inputs = fixture.nativeElement.querySelectorAll(
      'input[type="number"]'
    ) as NodeListOf<HTMLInputElement>;

    expect(pageText).toContain('Up to 10 tickets per booking');
    expect(pageText).toContain('Up to 7 tickets available');
    expect(pageText).toContain('Sold out');
    expect(inputs[0].max).toBe('10');
    expect(inputs[1].max).toBe('7');
    expect(inputs[2].max).toBe('0');
    expect(inputs[2].disabled).toBe(true);
    expect(inputs[0].getAttribute('aria-describedby')).toBe('ticket-general-limit');
  });

  it('keeps quantity updates within the effective maximum', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '12', 100);
    expect(component.ticketQuantity('general')).toBe(10);

    component.updateQuantity('vip', '12', 5);
    expect(component.ticketQuantity('vip')).toBe(5);

    component.updateQuantity('general', '-1', 100);
    expect(component.ticketQuantity('general')).toBe(0);
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

  it('accepts attendee names with letters, accents, apostrophes, and hyphens', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    const nameControl = component.attendees.at(0).controls.name;

    for (const name of ['John Smith', 'Anne-Marie', "O'Connor", 'José García']) {
      nameControl.setValue(name);
      expect(nameControl.valid).toBe(true);
    }
  });

  it('rejects attendee names without meaningful letters', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    const nameControl = component.attendees.at(0).controls.name;

    for (const name of ['23234', '---', '']) {
      nameControl.setValue(name);
      expect(nameControl.invalid).toBe(true);
    }
  });

  it('uses Angular email validation and allows trimmed email addresses', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    const emailControl = component.attendees.at(0).controls.email;

    for (const email of ['john@example.com', ' jane.doe+events@example.ca ']) {
      emailControl.setValue(email);
      expect(emailControl.valid).toBe(true);
    }

    for (const email of ['234234', 'john@', '@example.com', 'john.example.com']) {
      emailControl.setValue(email);
      expect(emailControl.invalid).toBe(true);
    }
  });

  it('accepts common Canadian and North American phone formats', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    const phoneControl = component.attendees.at(0).controls.phone;

    for (const phone of [
      '4165550123',
      '416-555-0123',
      '(416) 555-0123',
      '+1 416 555 0123'
    ]) {
      phoneControl.setValue(phone);
      expect(phoneControl.valid).toBe(true);
    }
  });

  it('rejects invalid phone numbers', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    const phoneControl = component.attendees.at(0).controls.phone;

    for (const phone of ['12345', 'abcdefghij', '24165550123', '416-555-ABCD', '']) {
      phoneControl.setValue(phone);
      expect(phoneControl.invalid).toBe(true);
    }
  });

  it('shows attendee names with ticket labels in the Step 3 summary', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.updateQuantity('vip', '1', 5);
    component.continueToAttendees();
    component.attendees.at(0).setValue({
      name: 'John Smith',
      email: 'john@example.com',
      phone: '4165550123'
    });
    component.attendees.at(1).setValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '416-555-0124'
    });
    component.continueToSummary();
    fixture.detectChanges();

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('Attendee 1 - General: John Smith');
    expect(pageText).toContain('Attendee 2 - VIP: Jane Doe');
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

  it('trims attendee values before creating a booking payload', () => {
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    component.attendees.at(0).setValue({
      name: '  John Smith  ',
      email: '  john@example.com  ',
      phone: '  (416) 555-0123  '
    });
    component.continueToSummary();
    component.confirmBooking();

    expect(lastPayload?.attendees[0]).toEqual({
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(416) 555-0123'
    });
  });

  it('blocks a past event and does not submit a booking', () => {
    event = createEvent('2026-07-14');
    const fixture = TestBed.createComponent(Booking);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as BookingTestApi;

    component.updateQuantity('general', '1', 100);
    component.continueToAttendees();
    component.confirmBooking();

    expect(fixture.nativeElement.textContent).toContain(
      'This event can no longer be booked'
    );
    expect(component.currentStep()).toBe(1);
    expect(createBookingCalls).toBe(0);
  });
});

function createEvent(date: string): Event {
  return {
    id: '1',
    title: 'Angular Summit',
    description: '',
    category: 'Technology',
    date,
    time: '09:00 AM',
    location: 'Toronto, ON',
    venue: 'Test Venue',
    image: 'https://images.unsplash.com/photo-1561489396-888724a1543d?auto=format&fit=crop&w=900&q=80',
    organizerName: 'Test Organizer',
    ticketTypes: [
      { id: 'general', name: 'General', price: 99, available: 100 },
      { id: 'vip', name: 'VIP', price: 199, available: 5 }
    ]
  };
}
