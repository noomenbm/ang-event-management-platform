import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'event-platform-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentTheme = signal<Theme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  private getInitialTheme(): Theme {
    const savedTheme = this.readSavedTheme();

    if (savedTheme) {
      return savedTheme;
    }

    if (this.prefersDarkMode()) {
      return 'dark';
    }

    return 'light';
  }

  private readSavedTheme(): Theme | null {
    const savedTheme = this.getStorage()?.getItem(THEME_STORAGE_KEY);

    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
  }

  private saveTheme(theme: Theme): void {
    this.getStorage()?.setItem(THEME_STORAGE_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }

  private prefersDarkMode(): boolean {
    if (!isPlatformBrowser(this.platformId) || !globalThis.matchMedia) {
      return false;
    }

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
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
