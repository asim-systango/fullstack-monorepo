'use client';

import { Button } from '@/components/ui';

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  /** Rows on the current page, used for the "showing x–y of z" range. */
  pageSize: number;
  /** True while a background refetch is in flight, to disable double-clicks. */
  busy?: boolean;
  onPageChange: (page: number) => void;
  /** Plural noun for the range label, e.g. "articles". */
  label: string;
};

/**
 * Server-side pagination controls. The list they belong to must page on the API
 * too — filtering or counting a single page in the browser goes wrong as soon as
 * there are more rows than fit on it.
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  busy = false,
  onPageChange,
  label,
}: Readonly<PaginationProps>) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label={`${label} pagination`}
      className="mt-6 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-sm text-muted-foreground">
        Showing {first}–{last} of {total} {label}
      </p>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || busy}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || busy}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
