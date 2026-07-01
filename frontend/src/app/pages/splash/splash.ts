import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, timer, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session';

const TIEMPO_MINIMO_MS = 3000;

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.html',
  styleUrls: ['./splash.css']
})
export class SplashComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sessionService = inject(SessionService)

  ngOnInit(): void {
    this.validarSesion();
  }

  private validarSesion(): void {
    const esperaMinima = timer(TIEMPO_MINIMO_MS);

    if (!this.authService.getToken()) {
      esperaMinima.subscribe(() => this.router.navigate(['/login']));
      return;
    }

    // Combinamos la validación real contra el back con el tiempo mínimo de espera.
    // forkJoin espera a que AMBOS terminen antes de continuar, así nunca se ve
    forkJoin([
      this.authService.autorizar().pipe(catchError(() => of(null))),
      esperaMinima
    ]).subscribe(([usuario]) => {
      if (usuario) {
        this.router.navigate(['/feed']);
        this.sessionService.start();
      } else {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}