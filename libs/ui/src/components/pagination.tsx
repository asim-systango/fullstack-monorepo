import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '../cn';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showSummary?: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  className,
  showSummary = true,
}: Readonly<PaginationProps>) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers array with intelligent ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (safeCurrentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safeCurrentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  if (totalItems <= pageSize && totalPages <= 1 && !showSummary) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground',
        className,
      )}
    >
      {showSummary && (
        <div>
          Showing <span className="font-semibold text-foreground">{startIndex}</span> to{' '}
          <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="h-8 px-2.5 text-xs gap-1"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-muted-foreground select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === safeCurrentPage;
            return (
              <Button
                key={`page-${page}`}
                variant={isCurrent ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  'h-8 w-8 p-0 text-xs font-medium rounded-md',
                  isCurrent
                    ? 'shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="h-8 px-2.5 text-xs gap-1"
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
