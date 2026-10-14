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
            className="block text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#FFC21A] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-lg bg-[#171717] border text-[#F5F5F5] text-sm placeholder-[#737373] transition-colors duration-150',
              'focus:outline-none focus:ring-1 focus:ring-[#FFC21A] focus:border-[#FFC21A]',
              'disabled:bg-[#101010] disabled:text-[#525252] disabled:cursor-not-allowed',
              error
                ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                : 'border-[#292929] hover:border-[#383838]',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',
              'py-2',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#737373]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#737373]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
