import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#F59E0B] text-black font-semibold hover:bg-[#FBBF24] active:bg-[#D97706] focus:ring-[#F59E0B] shadow-sm shadow-[#F59E0B]/20',
      secondary:
        'bg-[#1A1A1A] text-white border border-[#333333] hover:bg-[#222222] hover:border-[#F59E0B]/50 active:bg-[#111111] focus:ring-[#F59E0B]',
      outline:
        'border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 active:bg-[#F59E0B]/20 focus:ring-[#F59E0B]',
      danger:
        'bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700 focus:ring-red-500 shadow-sm shadow-red-600/20',
      ghost:
        'text-gray-300 hover:text-white hover:bg-[#222222] focus:ring-gray-600',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
