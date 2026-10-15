import React, { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#FFC21A] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-xl bg-[#16161A] border text-[#F5F5F5] text-sm placeholder-[#6B7280] transition-colors duration-200',
              'focus:outline-none focus:ring-1 focus:ring-[#FFC21A]/30 focus:border-[#FFC21A]',
              'disabled:bg-[#101014] disabled:text-[#525252] disabled:cursor-not-allowed',
              error
                ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                : 'border-white/10 hover:border-white/20',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',
              'py-2.5',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#9CA3AF]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-[#9CA3AF]">{helperText}</p>}
      </div>
    );
  }
);
