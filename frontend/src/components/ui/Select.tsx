import React, { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#FFC21A] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-lg bg-[#171717] border text-[#F5F5F5] text-sm appearance-none transition-colors duration-150',
              'focus:outline-none focus:ring-1 focus:ring-[#FFC21A] focus:border-[#FFC21A]',
              'disabled:bg-[#101010] disabled:text-[#525252] disabled:cursor-not-allowed',
              error
                ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                : 'border-[#292929] hover:border-[#383838]',
              'px-3.5 py-2 pr-10',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#171717] text-[#F5F5F5]">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#737373]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#737373]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
