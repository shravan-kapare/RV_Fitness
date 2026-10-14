import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

export interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={clsx('relative w-full max-w-sm', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#171717] border border-[#292929] hover:border-[#383838] focus:border-[#FFC21A] focus:ring-1 focus:ring-[#FFC21A] rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#737373] focus:outline-none transition-colors"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#737373] hover:text-[#F5F5F5] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
