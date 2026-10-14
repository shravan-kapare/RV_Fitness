import React from 'react';
import { Calendar } from 'lucide-react';

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-[#181818] border border-[#333333] hover:border-[#444444] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
        />
      </div>
      <span className="text-gray-500 text-xs">to</span>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-[#181818] border border-[#333333] hover:border-[#444444] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
};
