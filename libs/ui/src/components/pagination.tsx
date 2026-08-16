import { Button } from './button';
import { cn } from '../cn';

export type PaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  alwaysVisible?: boolean;
  className?: string;
}>;

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  alwaysVisible = true,
  className,
}: PaginationProps) {
  if (!alwaysVisible && totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const effectiveTotalPages = Math.max(1, totalPages);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border bg-card text-xs text-muted-foreground',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div>
          Showing <span className="font-bold text-foreground">{startItem}</span> to{' '}
          <span className="font-bold text-foreground">{endItem}</span> of{' '}
          <span className="font-bold text-foreground">{totalItems}</span> records
        </div>

        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground">Rows:</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground focus:border-[#4747A1] focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-xs h-8 px-2.5 font-semibold"
        >
          ← Previous
        </Button>

        <span className="px-2.5 py-1 text-xs font-bold text-foreground bg-muted/60 rounded-md">
          Page {currentPage} of {effectiveTotalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= effectiveTotalPages}
          className="text-xs h-8 px-2.5 font-semibold"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
