import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

// const MINUTO_MS = 60 * 1000;
const TIEMPO_AVISO_MS = 10 * 1000; // a los 10 min de sesión (quedan 5 de los 15 totales)

@Injectable({ providedIn: 'root' })
export class SessionService {
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Se llama una vez, apenas el usuario inicia sesión (login exitoso o sesión restaurada en el splash)
  start(): void {
    console.log('SessionService.start() llamado, timestamp:', this.authService.getLoginTimestamp());
    this.clear();

    const loginTimestamp = this.authService.getLoginTimestamp();
    if (!loginTimestamp) {
      return;
    }

    const tiempoTranscurrido = Date.now() - loginTimestamp;
    const tiempoRestanteHastaAviso = TIEMPO_AVISO_MS - tiempoTranscurrido;

    if (tiempoRestanteHastaAviso <= 0) {
      // Si por algún motivo ya pasamos el minuto 10 (ej. recargaste la página tarde), avisamos ya mismo
      this.mostrarModalDeExtension();
      return;
    }

    this.timeoutId = setTimeout(() => this.mostrarModalDeExtension(), tiempoRestanteHastaAviso);
  }

  // Se llama al cerrar sesión, para no dejar timers corriendo de una sesión que ya terminó
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private mostrarModalDeExtension(): void {
      console.log('¡Modal de sesión disparado!');

    this.modalService.showConfirm(
      'Tu sesión está por vencer',
      'Tu sesión vence en unos minutos. ¿Querés extenderla para seguir navegando sin interrupciones?',
      () => this.extenderSesion(),
      'Extender sesión',
      'No, gracias'
    );
  }

  private extenderSesion(): void {
    this.authService.refrescar().subscribe({
      next: () => {
        this.modalService.showSuccess('Sesión extendida', 'Tu sesión se extendió correctamente.');
        this.start(); // reinicia el contador desde cero con el nuevo token
      },
      error: () => {
        // Si el refresh falla (por ejemplo, el token ya venció antes de que confirmaras),
        // el interceptor se va a encargar de mandar a login en la próxima request que falle con 401.
        this.modalService.showError(
          'No pudimos extender tu sesión',
          'Es posible que tu sesión ya haya vencido. Iniciá sesión nuevamente.'
        );
      }
    });
  }
}