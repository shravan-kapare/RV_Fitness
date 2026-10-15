import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No records found',
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#141418] shadow-lg', className)}>
      <table className="w-full text-left text-xs text-[#F5F5F5] border-collapse">
        <thead className="bg-[#191920] border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-5 py-3.5 select-none font-mono',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-14 text-center text-[#9CA3AF]">
                <div className="flex justify-center items-center gap-2.5">
                  <LoadingSpinner size="md" />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-14 text-center text-[#737373]">
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <p className="text-sm font-medium text-[#9CA3AF]">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowId = item.id || `row-${index}`;
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={clsx(
                    'transition-colors duration-150',
                    isClickable ? 'cursor-pointer hover:bg-[#1E1E26]' : 'hover:bg-white/[0.02]',
                    index % 2 === 1 ? 'bg-white/[0.01]' : 'bg-transparent'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'px-5 py-3.5 text-xs text-[#E5E5E5]',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                        col.className
                      )}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
