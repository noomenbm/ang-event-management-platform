import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let documentRef: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    documentRef = TestBed.inject(DOCUMENT);
    documentRef.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('applies an initial theme', () => {
    const service = TestBed.inject(ThemeService);

    expect(['light', 'dark']).toContain(service.currentTheme());
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe(
      service.currentTheme()
    );
  });

  it('toggles and persists the selected theme', () => {
    const service = TestBed.inject(ThemeService);

    service.toggleTheme();

    expect(service.currentTheme()).toBe('dark');
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('event-platform-theme')).toBe('dark');
  });

  it('restores a saved theme preference', () => {
    localStorage.setItem('event-platform-theme', 'dark');

    const service = TestBed.inject(ThemeService);

    expect(service.currentTheme()).toBe('dark');
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
