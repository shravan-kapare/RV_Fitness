import React from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#121212]/50 border border-dashed border-[#333333] ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#F59E0B] mb-3">
        {icon || <AlertCircle className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      {description && <p className="text-xs text-gray-400 max-w-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
