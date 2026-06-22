import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Cada vez que cambia el signal, lo aplicamos al DOM y lo guardamos
    effect(() => {
      const current = this.theme();
      document.documentElement.setAttribute('data-theme', current);
      localStorage.setItem('theme', current);
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Si no hay nada guardado, respeta la preferencia del sistema operativo
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}