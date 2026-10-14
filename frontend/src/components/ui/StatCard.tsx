import React from 'react';
import clsx from 'clsx';

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
        'relative rounded-xl p-5 border transition-all duration-150 overflow-hidden bg-[#111111]',
        highlight
          ? 'border-[#FFC21A]/40 bg-gradient-to-b from-[#19160E] to-[#111111]'
          : 'border-[#292929] hover:border-[#383838]'
      )}
    >
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FFC21A]" />
      )}

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A5A5A5]">
          {displayLabel}
        </span>
        {icon && (
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center border text-xs',
              highlight
                ? 'bg-[#FFC21A]/10 border-[#FFC21A]/20 text-[#FFC21A]'
                : 'bg-[#171717] border-[#292929] text-[#A5A5A5]'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-[#F5F5F5] tabular-nums">
          {value}
        </div>

        {(displaySubtext || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={clsx(
                  'font-medium tabular-nums',
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
            {displaySubtext && (
              <span className="text-[#737373] truncate">{displaySubtext}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
