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
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080808] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#FFC21A] text-[#080808] font-semibold hover:bg-[#E6AC12] active:bg-[#D49D0E] focus:ring-[#FFC21A] shadow-sm',
      secondary:
        'bg-[#171717] text-[#F5F5F5] border border-[#292929] hover:bg-[#1E1E1E] hover:border-[#383838] active:bg-[#121212] focus:ring-zinc-600',
      outline:
        'border border-[#FFC21A]/80 text-[#FFC21A] hover:bg-[#FFC21A]/10 active:bg-[#FFC21A]/20 focus:ring-[#FFC21A]',
      danger:
        'bg-rose-600/90 text-white hover:bg-rose-500 active:bg-rose-700 focus:ring-rose-500 shadow-sm',
      ghost:
        'text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#171717] focus:ring-zinc-700',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
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
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
