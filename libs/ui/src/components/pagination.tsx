import { Button } from './button';
import { cn } from '../cn';

export type PaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}>;

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-border bg-card text-xs text-muted-foreground',
        className,
      )}
    >
      <div>
        Showing <span className="font-semibold text-foreground">{startItem}</span> to{' '}
        <span className="font-semibold text-foreground">{endItem}</span> of{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> items
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-xs h-8 px-2.5"
        >
          ← Previous
        </Button>

        <span className="px-2 font-medium text-foreground">
          Page {currentPage} of {totalPages || 1}
        </span>

        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-xs h-8 px-2.5"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
