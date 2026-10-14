import React, { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
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
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-[#262626] bg-[#111111]', className)}>
      <table className="w-full text-left text-xs text-gray-200 border-collapse">
        <thead className="bg-[#161616] border-b border-[#262626] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3.5 select-none',
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
              <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                <div className="flex justify-center items-center gap-2">
                  <LoadingSpinner size="md" />
                  <span>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={item.id || idx}
                onClick={() => onRowClick && onRowClick(item)}
                className={clsx(
                  'transition-colors duration-150',
                  onRowClick ? 'cursor-pointer hover:bg-[#1A1A1A]' : 'hover:bg-[#161616]'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3.5 whitespace-nowrap',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      col.className
                    )}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Low-level component primitives for custom table assemblies
export const RawTable: React.FC<HTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-[#333333] bg-[#111111]">
    <table className={clsx('w-full text-left text-sm text-gray-200 border-collapse', className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <thead className={clsx('bg-[#161616] border-b border-[#2A2A2A] text-xs font-semibold uppercase tracking-wider text-gray-400', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <tbody className={clsx('divide-y divide-[#222222]', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<HTMLAttributes<HTMLTableRowElement> & { isClickable?: boolean }> = ({
  className,
  children,
  isClickable = false,
  ...props
}) => (
  <tr
    className={clsx(
      'transition-colors duration-150',
      isClickable ? 'cursor-pointer hover:bg-[#1E1E1E]' : 'hover:bg-[#181818]',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th className={clsx('px-4 py-3.5 select-none font-semibold', className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <td className={clsx('px-4 py-3.5 whitespace-nowrap text-sm text-gray-200', className)} {...props}>
    {children}
  </td>
);
