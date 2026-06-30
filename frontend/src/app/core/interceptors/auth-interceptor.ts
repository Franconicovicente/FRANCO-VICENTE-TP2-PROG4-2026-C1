import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const token = authService.getToken();

  const reqConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el back responde 401, el token ya no es válido (vencido o corrupto):
      // limpiamos la sesión y mandamos al usuario a login automáticamente.
      if (error.status === 401) {
        sessionService.clear();
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};