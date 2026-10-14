import React, { useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth,
  size = 'md',
}) => {
  const actualWidth = maxWidth || size;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={clsx(
            'relative transform overflow-hidden rounded-xl bg-[#111111] border border-[#292929] text-left shadow-2xl transition-all sm:my-8 w-full animate-fade-in',
            maxWidths[actualWidth]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-[#222222]">
              <div>
                {title && <h3 className="text-base font-bold text-[#F5F5F5]">{title}</h3>}
                {description && <p className="text-xs text-[#A5A5A5] mt-0.5">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#737373] hover:text-[#F5F5F5] rounded-lg p-1 hover:bg-[#1E1E1E] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 text-[#F5F5F5]">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-[#0D0D0D] border-t border-[#222222]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
