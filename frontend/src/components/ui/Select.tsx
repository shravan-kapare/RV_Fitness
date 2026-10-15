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
            className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#FFC21A] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-xl bg-[#16161A] border text-[#F5F5F5] text-sm appearance-none transition-colors duration-200',
              'focus:outline-none focus:ring-1 focus:ring-[#FFC21A]/30 focus:border-[#FFC21A]',
              'disabled:bg-[#101014] disabled:text-[#525252] disabled:cursor-not-allowed',
              error
                ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                : 'border-white/10 hover:border-white/20',
              'px-3.5 py-2.5 pr-10',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#16161A] text-[#F5F5F5]">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-[#9CA3AF]">{helperText}</p>}
      </div>
    );
  }
);
