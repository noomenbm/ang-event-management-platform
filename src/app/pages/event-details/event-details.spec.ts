import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { Event } from '../../models';
import { EventsService } from '../../services/events.service';
import { EventDetails } from './event-details';

describe('EventDetails', () => {
  let event: Event;

  beforeEach(async () => {
    event = createEvent('2026-07-14');

    await TestBed.configureTestingModule({
      imports: [EventDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map([['id', event.id]])
            }
          }
        },
        {
          provide: EventsService,
          useValue: {
            getEventById: () => of(event)
          }
        }
      ]
    }).compileComponents();
  });

  it('marks a past event as ended instead of showing a booking link', () => {
    const fixture = TestBed.createComponent(EventDetails);
    fixture.detectChanges();

    expect(pageText(fixture)).toContain('Event has ended.');
    expect(fixture.nativeElement.querySelector('.book-link')).toBeNull();
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
    image: '/favicon.ico',
    organizerName: 'Test Organizer',
    ticketTypes: [{ id: 'general', name: 'General', price: 99, available: 100 }]
  };
}

function pageText(fixture: ComponentFixture<EventDetails>): string {
  return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
}
