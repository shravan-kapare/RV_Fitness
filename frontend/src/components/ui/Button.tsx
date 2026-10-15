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
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080808] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#FFC21A] text-black font-extrabold hover:bg-[#e5ad16] active:bg-[#d49d0e] focus:ring-[#FFC21A] shadow-md shadow-[#FFC21A]/10 active:scale-[0.98]',
      secondary:
        'bg-[#141418] text-[#F5F5F5] border border-white/10 hover:bg-[#1E1E24] hover:border-white/20 active:bg-[#101014] focus:ring-zinc-600 active:scale-[0.98]',
      outline:
        'border border-[#FFC21A]/70 text-[#FFC21A] hover:bg-[#FFC21A]/10 active:bg-[#FFC21A]/20 focus:ring-[#FFC21A] active:scale-[0.98]',
      danger:
        'bg-rose-600/90 text-white font-semibold hover:bg-rose-500 active:bg-rose-700 focus:ring-rose-500 shadow-sm active:scale-[0.98]',
      ghost:
        'text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/5 focus:ring-zinc-700 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
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
