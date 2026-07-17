import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Event } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly http = inject(HttpClient);

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${API_BASE_URL}/events`);
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${API_BASE_URL}/events/${id}`);
  }
}
