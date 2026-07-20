import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

const FAVORITES_STORAGE_KEY = 'event-platform-favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoriteEventsService {
  private readonly platformId = inject(PLATFORM_ID);

  loadFavoriteIds(): ReadonlySet<string> {
    const storage = this.getStorage();

    if (!storage) {
      return new Set<string>();
    }

    try {
      const savedValue = storage.getItem(FAVORITES_STORAGE_KEY);
      const parsedValue = savedValue ? JSON.parse(savedValue) : [];

      if (!Array.isArray(parsedValue)) {
        return new Set<string>();
      }

      return new Set(parsedValue.filter((id): id is string => typeof id === 'string'));
    } catch {
      return new Set<string>();
    }
  }

  toggleFavorite(currentFavorites: ReadonlySet<string>, eventId: string): ReadonlySet<string> {
    const nextFavorites = new Set(currentFavorites);

    if (nextFavorites.has(eventId)) {
      nextFavorites.delete(eventId);
    } else {
      nextFavorites.add(eventId);
    }

    this.saveFavoriteIds(nextFavorites);

    return nextFavorites;
  }

  private saveFavoriteIds(favoriteIds: ReadonlySet<string>): void {
    this.getStorage()?.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([...favoriteIds])
    );
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
