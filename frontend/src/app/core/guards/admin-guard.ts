import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos la señal computada que agregamos antes
  if (authService.isAdmin()) {
    return true; // Sos admin, pasá sampa
  }

  // Si no es admin, lo pateamos al feed (o a donde prefieras)
  router.navigate(['/feed']);
  return false;
};