'use client';

import { Button, Select } from '@shared/ui/components';

type PaginationBarProps = Readonly<{
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  limitOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  label?: string;
}>;

export function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  limitOptions = [10, 25, 50],
  onPageChange,
  onLimitChange,
  label = 'items',
}: PaginationBarProps) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p className="leading-none">
        Showing {from}–{to} of {total} {label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange ? (
          <Select
            aria-label="Rows per page"
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="splitter-select-compact h-8 shrink-0 py-0 text-xs leading-none"
          >
            {limitOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 min-w-[5.5rem] shrink-0"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="inline-flex h-8 shrink-0 items-center justify-center px-1 tabular-nums leading-none text-foreground">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 min-w-[5.5rem] shrink-0"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
