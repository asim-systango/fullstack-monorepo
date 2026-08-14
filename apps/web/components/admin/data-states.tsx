import type { ReactNode } from 'react';

type AsyncListStateProps = {
  isLoading: boolean;
  isError: boolean;
  /** True only once loading finished without error and the result was empty. */
  isEmpty: boolean;
  errorLabel: string;
  emptyLabel: string;
  /** Rendered inside the empty panel, e.g. a clear-filters button. */
  emptyAction?: ReactNode;
  /** Placeholder rows to draw while loading. */
  skeletonRows?: number;
};

/**
 * The three states every admin list has to distinguish: loading, failed, and
 * genuinely empty. Returns null as soon as there are rows to render, so callers
 * can drop it in above their list.
 */
export function AsyncListState({
  isLoading,
  isError,
  isEmpty,
  errorLabel,
  emptyLabel,
  emptyAction,
  skeletonRows = 4,
}: Readonly<AsyncListStateProps>) {
  if (isLoading) {
    return (
      <output aria-busy="true" className="block space-y-3">
        <span className="sr-only">Loading…</span>
        {Array.from({ length: skeletonRows }, (_, index) => (
          <span
            key={index}
            className="block h-16 animate-pulse rounded-lg border border-border bg-surface-muted/60"
          />
        ))}
      </output>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        {errorLabel}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
      </div>
    );
  }

  return null;
}
