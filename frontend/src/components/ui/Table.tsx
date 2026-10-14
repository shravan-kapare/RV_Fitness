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
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-[#292929] bg-[#111111]', className)}>
      <table className="w-full text-left text-xs text-[#F5F5F5] border-collapse">
        <thead className="bg-[#141414] border-b border-[#292929] text-[11px] font-semibold uppercase tracking-wider text-[#A5A5A5]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 select-none',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F1F1F]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-[#A5A5A5]">
                <div className="flex justify-center items-center gap-2">
                  <LoadingSpinner size="md" />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-[#737373]">
                <div className="flex flex-col items-center justify-center gap-1">
                  <p className="text-sm font-medium text-[#A5A5A5]">{emptyMessage}</p>
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
                    'transition-colors duration-100',
                    isClickable ? 'cursor-pointer hover:bg-[#181818]' : 'hover:bg-[#151515]'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={`${rowId}-${col.key}`}
                      className={clsx(
                        'px-4 py-3 text-xs',
                        col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left',
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
