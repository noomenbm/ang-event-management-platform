import { TestBed } from '@angular/core/testing';

import { FavoriteEventsService } from './favorite-events.service';

describe('FavoriteEventsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  it('loads an empty favorite set when nothing is saved', () => {
    const service = TestBed.inject(FavoriteEventsService);

    expect([...service.loadFavoriteIds()]).toEqual([]);
  });

  it('loads saved favorite event IDs from localStorage', () => {
    localStorage.setItem('event-platform-favorites', JSON.stringify(['1', '3']));

    const service = TestBed.inject(FavoriteEventsService);

    expect([...service.loadFavoriteIds()]).toEqual(['1', '3']);
  });

  it('toggles favorites and persists the updated list', () => {
    const service = TestBed.inject(FavoriteEventsService);

    const favorites = service.toggleFavorite(new Set<string>(['1']), '2');

    expect([...favorites]).toEqual(['1', '2']);
    expect(localStorage.getItem('event-platform-favorites')).toBe('["1","2"]');
  });

  it('removes an existing favorite and persists the update', () => {
    const service = TestBed.inject(FavoriteEventsService);

    const favorites = service.toggleFavorite(new Set<string>(['1', '2']), '1');

    expect([...favorites]).toEqual(['2']);
    expect(localStorage.getItem('event-platform-favorites')).toBe('["2"]');
  });
});
