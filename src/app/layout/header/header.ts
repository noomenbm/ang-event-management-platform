import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private readonly themeService = inject(ThemeService);

  protected readonly currentTheme = this.themeService.currentTheme;
  protected readonly themeToggleLabel = computed(() =>
    this.currentTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  );

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
