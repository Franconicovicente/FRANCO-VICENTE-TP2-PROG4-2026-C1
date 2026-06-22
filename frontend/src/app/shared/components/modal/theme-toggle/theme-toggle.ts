import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.html',
  styleUrls: ['./theme-toggle.css']
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}