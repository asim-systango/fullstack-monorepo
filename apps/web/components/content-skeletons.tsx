import { Skeleton } from '@shared/ui/components';
import { BrandLoader } from './brand-loader';

export function TagsSkeleton({ count = 4 }: Readonly<{ count?: number }>) {
  return (
    <div className="tf-skel-tags" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} size="line" className="tf-skel-tag" />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 3,
}: Readonly<{ rows?: number; cols?: number }>) {
  return (
    <div className="tf-skel-table" aria-busy="true" aria-label="Loading table">
      <div className="tf-skel-table-head">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} size="line" className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="tf-skel-table-row">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} size="line" className={c === 0 ? 'h-4 w-40' : 'h-4 w-24'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: Readonly<{ count?: number }>) {
  return (
    <div className="tf-skel-grid" aria-busy="true" aria-label="Loading cards">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="tf-skel-card">
          <Skeleton size="line" className="mb-3 h-5 w-16" />
          <Skeleton size="md" className="mb-2 h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton size="line" className="tf-skel-tag" />
            <Skeleton size="line" className="tf-skel-tag" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function IssueListSkeleton({ count = 4 }: Readonly<{ count?: number }>) {
  return (
    <div className="tf-skel-issues" aria-busy="true" aria-label="Loading issues">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="tf-skel-issue">
          <Skeleton size="md" className="h-5 w-2/3" />
          <div className="mt-2 flex gap-2">
            <Skeleton size="line" className="tf-skel-tag" />
            <Skeleton size="line" className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BoardColumnSkeleton() {
  return (
    <div className="tf-board-grid" aria-busy="true" aria-label="Loading board">
      {[0, 1, 2].map((col) => (
        <div key={col} className="tf-skel-board-col">
          <div className="mb-3 flex justify-between">
            <Skeleton size="line" className="h-4 w-24" />
            <Skeleton size="line" className="tf-skel-tag" />
          </div>
          <Skeleton size="lg" className="mb-3 h-24 rounded-xl" />
          <Skeleton size="lg" className="mb-3 h-24 rounded-xl" />
          <Skeleton size="lg" className="h-20 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * Main content fetch state — brand spinner only (not wrapped in a table).
 * Pass `withSkeleton` when you also want structural placeholders underneath.
 */
export function PageFetchSkeleton({
  variant = 'none',
  label = 'Loading TaskFlow…',
}: Readonly<{
  variant?: 'none' | 'cards' | 'table' | 'issues' | 'board' | 'members';
  label?: string;
}>) {
  return (
    <div className="tf-page-fetch tf-enter">
      <BrandLoader label={label} size="lg" />
      {variant === 'cards' ? <CardGridSkeleton /> : null}
      {variant === 'table' ? <TableSkeleton /> : null}
      {variant === 'issues' ? <IssueListSkeleton /> : null}
      {variant === 'board' ? <BoardColumnSkeleton /> : null}
      {variant === 'members' ? (
        <div className="space-y-3">
          <TagsSkeleton />
          <IssueListSkeleton count={3} />
        </div>
      ) : null}
    </div>
  );
}
