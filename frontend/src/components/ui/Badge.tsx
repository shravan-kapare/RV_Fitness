import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'gold';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    success: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40',
    warning: 'bg-amber-950/40 text-amber-300 border border-amber-800/40',
    danger: 'bg-rose-950/40 text-rose-400 border border-rose-800/40',
    info: 'bg-sky-950/40 text-sky-300 border border-sky-800/40',
    gold: 'bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30',
    default: 'bg-[#1C1C1C] text-[#A5A5A5] border border-[#292929]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-[11px] px-2.5 py-0.5 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full uppercase tracking-wider select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
