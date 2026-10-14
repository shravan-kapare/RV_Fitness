import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center mb-3.5 ${
            variant === 'danger'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/20'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-[#F5F5F5] mb-1.5">{title}</h3>
        <p className="text-xs text-[#A5A5A5] mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
