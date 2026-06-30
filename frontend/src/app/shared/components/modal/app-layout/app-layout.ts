import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SessionService } from '../../../../core/services/session';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent],
  templateUrl: './app-layout.html',
  styleUrls: ['./app-layout.css']
})
export class AppLayoutComponent {
  authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  onLogout(): void {
    this.sessionService.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}