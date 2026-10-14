import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtext?: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  title,
  value,
  subtext,
  description,
  icon,
  trend,
  highlight = false,
}) => {
  const displayLabel = title || label || '';
  const displaySubtext = description || subtext;
  return (
    <div
      className={clsx(
        'relative rounded-xl p-5 border transition-all duration-200 overflow-hidden',
        highlight
          ? 'bg-gradient-to-br from-[#1E1911] to-[#121212] border-[#F59E0B]/40 shadow-lg shadow-[#F59E0B]/5'
          : 'bg-[#111111] border-[#333333] hover:border-[#444444]'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {displayLabel}
        </span>
        {icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center border',
              highlight
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                : 'bg-[#181818] border-[#2A2A2A] text-gray-300'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>

        {(displaySubtext || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={clsx(
                  'flex items-center font-semibold gap-0.5',
                  trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}%
              </span>
            )}
            {displaySubtext && <span className="text-gray-400">{displaySubtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
