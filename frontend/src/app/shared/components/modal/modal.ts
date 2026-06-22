import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.css']
})
export class ModalComponent {
  modalService = inject(ModalService);

  close(): void {
    this.modalService.close();
  }

  confirm(): void {
    const modal = this.modalService.activeModal();
    if (modal?.onConfirm) {
      modal.onConfirm();
    }
    this.close();
  }
}