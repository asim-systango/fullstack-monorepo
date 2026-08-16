import type { ReactNode } from 'react';
import { Alert, Button, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { StaffEmptyState } from './staff-empty-state';

export function StaffListStatus({
  isPending,
  isError,
  error,
  isEmpty,
  hasFilters,
  emptyTitle,
  emptyDescription,
  filteredTitle = 'No matching results',
  filteredDescription = 'Try a different search or clear the current filters.',
  onRetry,
  onClearFilters,
  children,
}: Readonly<{
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isEmpty: boolean;
  hasFilters: boolean;
  emptyTitle: string;
  emptyDescription: string;
  filteredTitle?: string;
  filteredDescription?: string;
  onRetry?: () => void;
  onClearFilters?: () => void;
  children: ReactNode;
}>) {
  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton size="lg" />
        <Skeleton size="lg" />
        <Skeleton size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert tone="danger" title="Could not load results">
        <p className="m-0">{toUserMessage(error)}</p>
        {onRetry ? (
          <div className="mt-3">
            <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <StaffEmptyState
        title={hasFilters ? filteredTitle : emptyTitle}
        description={hasFilters ? filteredDescription : emptyDescription}
        action={
          hasFilters && onClearFilters ? (
            <Button type="button" size="sm" variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return children;
}
