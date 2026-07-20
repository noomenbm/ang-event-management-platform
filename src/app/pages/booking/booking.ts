import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Attendee, Booking as CreatedBooking, BookingTicket, Event } from '../../models';
import { BookingsService } from '../../services/bookings.service';
import { EventsService } from '../../services/events.service';
import { isEventPast } from '../../shared/date-utils';
import {
  AttendeeSlot,
  buildAttendeeSlots,
  buildBookingCreatePayload,
  buildBookingTickets,
  bookingDateValue,
  clampQuantity,
  effectiveTicketMaximum,
  generateBookingReference,
  hasSelectedTicket,
  ticketLimitMessage,
  totalAmount,
  totalTickets
} from './booking.helpers';

interface AttendeeForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
}

type BookingStep = 1 | 2 | 3;
type AttendeeField = 'name' | 'email' | 'phone';

@Component({
  selector: 'app-booking',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly eventsService = inject(EventsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  protected readonly attendeeForm = this.formBuilder.group({
    attendees: this.formBuilder.array<FormGroup<AttendeeForm>>([])
  });
  protected readonly attendeeSlots = signal<AttendeeSlot[]>([]);
  protected readonly createdBooking = signal<CreatedBooking | null>(null);
  protected readonly currentStep = signal<BookingStep>(1);
  protected readonly errorMessage = signal('');
  protected readonly event = signal<Event | null>(null);
  protected readonly eventHasEnded = computed(() => {
    const selectedEvent = this.event();

    return selectedEvent ? isEventPast(selectedEvent.date) : false;
  });
  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly notificationMessage = signal('');
  protected readonly notificationType = signal<'success' | 'error'>('success');
  protected readonly quantityError = signal('');
  protected readonly quantities = signal<ReadonlyMap<string, number>>(new Map());
  protected readonly submitError = signal('');
  protected readonly selectedTickets = computed<BookingTicket[]>(() => {
    const selectedEvent = this.event();

    if (!selectedEvent) {
      return [];
    }

    return buildBookingTickets(selectedEvent, this.quantities());
  });
  protected readonly totalAmount = computed(() => totalAmount(this.selectedTickets()));
  protected readonly totalTickets = computed(() => totalTickets(this.selectedTickets()));

  ngOnInit(): void {
    this.loadEvent();
  }

  get attendees(): FormArray<FormGroup<AttendeeForm>> {
    return this.attendeeForm.controls.attendees;
  }

  protected loadEvent(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.errorMessage.set('No event ID was provided.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventsService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.quantities.set(
          new Map(event.ticketTypes.map((ticket) => [ticket.id, 0]))
        );
        this.syncAttendeeForms();
        this.isLoading.set(false);
      },
      error: () => {
        this.event.set(null);
        this.errorMessage.set('Booking information could not be loaded.');
        this.isLoading.set(false);
      }
    });
  }

  protected ticketQuantity(ticketId: string): number {
    return this.quantities().get(ticketId) ?? 0;
  }

  protected ticketMaximum(available: number): number {
    return effectiveTicketMaximum(available);
  }

  protected ticketLimitMessage(available: number): string {
    return ticketLimitMessage(available);
  }

  protected ticketLimitId(ticketId: string): string {
    return `ticket-${ticketId}-limit`;
  }

  protected updateQuantity(ticketId: string, value: string, available: number): void {
    if (this.eventHasEnded()) {
      return;
    }

    const parsedValue = Number(value);
    const nextQuantities = new Map(this.quantities());
    nextQuantities.set(ticketId, clampQuantity(parsedValue, available));
    this.quantities.set(nextQuantities);
    this.quantityError.set('');
    this.submitError.set('');
    this.syncAttendeeForms();
  }

  protected goToStepOne(): void {
    this.submitError.set('');
    this.currentStep.set(1);
  }

  protected continueToAttendees(): void {
    if (this.eventHasEnded()) {
      this.quantityError.set('This event has ended and can no longer be booked.');
      return;
    }

    if (!hasSelectedTicket(this.selectedTickets())) {
      this.quantityError.set('Select at least one ticket to continue.');
      return;
    }

    this.quantityError.set('');
    this.submitError.set('');
    this.syncAttendeeForms();
    this.currentStep.set(2);
  }

  protected continueToSummary(): void {
    if (this.eventHasEnded()) {
      this.submitError.set('This event has ended and can no longer be booked.');
      return;
    }

    if (this.attendeeForm.invalid) {
      this.attendeeForm.markAllAsTouched();
      return;
    }

    this.submitError.set('');
    this.currentStep.set(3);
  }

  protected goToStepTwo(): void {
    this.submitError.set('');
    this.currentStep.set(2);
  }

  protected confirmBooking(): void {
    const selectedEvent = this.event();

    if (this.isSubmitting() || this.createdBooking()) {
      return;
    }

    if (!selectedEvent || this.eventHasEnded()) {
      this.submitError.set('This event has ended and can no longer be booked.');
      return;
    }

    if (!hasSelectedTicket(this.selectedTickets())) {
      this.submitError.set('Select tickets before confirming this booking.');
      return;
    }

    if (this.attendeeForm.invalid) {
      this.attendeeForm.markAllAsTouched();
      this.submitError.set('Complete all attendee details before confirming.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.notificationMessage.set('');

    const payload = buildBookingCreatePayload(
      selectedEvent,
      this.selectedTickets(),
      this.attendeePayload(),
      generateBookingReference(),
      bookingDateValue()
    );

    this.bookingsService.createBooking(payload).subscribe({
      next: (booking) => {
        this.createdBooking.set(booking);
        this.notificationType.set('success');
        this.notificationMessage.set('Booking successfully created.');
        this.isSubmitting.set(false);
      },
      error: () => {
        this.submitError.set('Booking could not be created. Please try again.');
        this.notificationType.set('error');
        this.notificationMessage.set('Booking creation failed.');
        this.isSubmitting.set(false);
      }
    });
  }

  protected attendeeLabel(index: number): string {
    const slot = this.attendeeSlots()[index];

    if (!slot) {
      return `Attendee ${index + 1}`;
    }

    return `Attendee ${index + 1} - ${slot.ticketType}`;
  }

  protected attendeeSummary(): { label: string; name: string }[] {
    return this.attendees.controls.map((control, index) => ({
      label: this.attendeeLabel(index),
      name: control.controls.name.value.trim()
    }));
  }

  protected fieldErrorId(index: number, field: AttendeeField): string {
    return `attendee-${index}-${field}-error`;
  }

  protected nameErrorMessage(control: AbstractControl): string {
    return control.hasError('required')
      ? 'Name is required.'
      : 'Enter a valid name using letters.';
  }

  protected emailErrorMessage(control: AbstractControl): string {
    return control.hasError('required')
      ? 'Email is required.'
      : 'Enter a valid email address.';
  }

  protected phoneErrorMessage(control: AbstractControl): string {
    return control.hasError('required')
      ? 'Phone number is required.'
      : 'Enter a valid Canadian or North American phone number.';
  }

  protected shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.currentStep() === 3);
  }

  private syncAttendeeForms(): void {
    const previousValues = this.attendees.controls.map((control) =>
      control.getRawValue()
    );
    const slots = buildAttendeeSlots(this.selectedTickets());
    const nextControls = slots.map((_, index) =>
      this.createAttendeeGroup(previousValues[index])
    );

    this.attendees.clear();
    nextControls.forEach((control) => this.attendees.push(control));
    this.attendeeSlots.set(slots);
  }

  private createAttendeeGroup(attendee?: Attendee): FormGroup<AttendeeForm> {
    return this.formBuilder.group({
      name: this.formBuilder.nonNullable.control(attendee?.name ?? '', [
        Validators.required,
        attendeeNameValidator
      ]),
      email: this.formBuilder.nonNullable.control(attendee?.email ?? '', [
        Validators.required,
        trimmedEmailValidator
      ]),
      phone: this.formBuilder.nonNullable.control(attendee?.phone ?? '', [
        Validators.required,
        phoneValidator
      ])
    });
  }

  private attendeePayload(): Attendee[] {
    return this.attendees.controls.map((control) => {
      const attendee = control.getRawValue();

      return {
        name: attendee.name.trim(),
        email: attendee.email.trim(),
        phone: attendee.phone.trim()
      };
    });
  }
}

function attendeeNameValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();

  if (!value) {
    return null;
  }

  const allowedCharacters = /^[\p{L}\s'-]+$/u;
  const meaningfulCharacters = value.replace(/[\s'-]/gu, '');

  if (
    meaningfulCharacters.length < 2 ||
    !/\p{L}/u.test(value) ||
    !allowedCharacters.test(value)
  ) {
    return { attendeeName: true };
  }

  return null;
}

function trimmedEmailValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();

  if (!value) {
    return null;
  }

  return Validators.email(new FormControl(value));
}

function phoneValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();

  if (!value) {
    return null;
  }

  if (!/^\+?[\d\s().-]+$/.test(value)) {
    return { phone: true };
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length === 10) {
    return null;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return null;
  }

  return { phone: true };
}
