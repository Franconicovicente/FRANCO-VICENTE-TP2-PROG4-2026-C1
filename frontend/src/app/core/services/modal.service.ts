import { Injectable, signal } from '@angular/core';
import { ModalData } from '../../shared/components/modal/modal.model';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // Señal con el modal actualmente visible (null = sin modal abierto)
  activeModal = signal<ModalData | null>(null);

  open(data: ModalData): void {
    this.activeModal.set(data);
  }

  close(): void {
    this.activeModal.set(null);
  }

  // Helpers rápidos para no repetir el objeto completo cada vez
  showSuccess(title: string, message: string): void {
    this.open({ type: 'success', title, message });
  }

  showError(title: string, message: string): void {
    this.open({ type: 'error', title, message });
  }

  showInfo(title: string, message: string): void {
    this.open({ type: 'info', title, message });
  }

  showConfirm(title: string, message: string, onConfirm: () => void, confirmText = 'Confirmar', cancelText = 'Cancelar'): void {
    this.open({ type: 'confirm', title, message, onConfirm, confirmText, cancelText });
  }
}