export type ModalType = 'success' | 'error' | 'info' | 'confirm';
 
export interface ModalData {
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}
 