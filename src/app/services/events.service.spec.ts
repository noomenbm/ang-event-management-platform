import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../config/api.config';
import { Event } from '../models';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let httpTesting: HttpTestingController;
  let service: EventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventsService, provideHttpClient(), provideHttpClientTesting()]
    });

    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(EventsService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('gets one event by ID from the expected endpoint', () => {
    const event = createEvent('1');
    let result: Event | undefined;

    service.getEventById('1').subscribe((response) => {
      result = response;
    });

    const request = httpTesting.expectOne(`${API_BASE_URL}/events/1`);
    expect(request.request.method).toBe('GET');
    request.flush(event);

    expect(result).toEqual(event);
  });
});

function createEvent(id: string): Event {
  return {
    id,
    title: 'Angular Summit',
    description: '',
    category: 'Technology',
    date: '2026-07-14',
    time: '09:00 AM',
    location: 'Toronto, ON',
    venue: 'Test Venue',
    image: '/favicon.ico',
    organizerName: 'Test Organizer',
    ticketTypes: [{ id: 'general', name: 'General', price: 99, available: 100 }]
  };
}
