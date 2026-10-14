import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  limit?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit = 20,
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-[#A5A5A5]">
      {totalItems !== undefined ? (
        <div>
          Showing <span className="text-[#F5F5F5] font-semibold tabular-nums">{startItem}</span> to{' '}
          <span className="text-[#F5F5F5] font-semibold tabular-nums">{endItem}</span> of{' '}
          <span className="text-[#F5F5F5] font-semibold tabular-nums">{totalItems}</span> records
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#292929] bg-[#141414] text-[#A5A5A5] hover:text-[#F5F5F5] hover:border-[#383838] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 2 + i;
              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer tabular-nums',
                  isActive
                    ? 'bg-[#FFC21A] text-[#080808]'
                    : 'bg-[#141414] border border-[#292929] text-[#A5A5A5] hover:text-[#F5F5F5] hover:border-[#383838]'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#292929] bg-[#141414] text-[#A5A5A5] hover:text-[#F5F5F5] hover:border-[#383838] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
