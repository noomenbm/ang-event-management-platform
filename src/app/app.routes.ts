import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'events'
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/events/events').then((component) => component.Events)
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/event-details/event-details').then(
        (component) => component.EventDetails
      )
  },
  {
    path: 'book/:eventId',
    loadComponent: () =>
      import('./pages/booking/booking').then((component) => component.Booking)
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/my-bookings/my-bookings').then(
        (component) => component.MyBookings
      )
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((component) => component.NotFound)
  }
];
