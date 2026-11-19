'use client';

import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Button,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
} from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import { AuctionCard, AuctionCardSkeleton, AuctionFilters } from '@/components/auctions';
import { auctionsApi, auctionQueryKeys } from '@/lib/api';
import type { AuctionStatus } from '@/lib/schemas/auction';
import {
  clearFilters,
  filtersToListParams,
  hydrateFiltersFromUrl,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

function parseStatus(value: string | null): '' | AuctionStatus {
  if (value === 'open' || value === 'closed' || value === 'cancelled') {
    return value;
  }
  return '';
}

function AuctionsPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const applied = useAppSelector((s) => s.ui.appliedFilter);
  const [page, setPage] = useState(1);
  const limit = 12;
  const params = filtersToListParams(applied, page, limit);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const category = searchParams.get('category') ?? '';
    const statusParam = searchParams.get('status');
    const status = statusParam === null ? 'open' : parseStatus(statusParam);
    const minPrice = searchParams.get('minPrice') ?? '';
    const maxPrice = searchParams.get('maxPrice') ?? '';

    if (!q && !category && statusParam === null && !minPrice && !maxPrice) {
      return;
    }

    dispatch(
      hydrateFiltersFromUrl({
        q,
        category,
        status: status || 'open',
        minPrice,
        maxPrice,
      }),
    );
    setPage(1);
  }, [dispatch, searchParams]);

  useEffect(() => {
    setPage(1);
  }, [applied]);

  const query = useQuery({
    queryKey: auctionQueryKeys.list(params),
    queryFn: () => auctionsApi.list(params),
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / limit)) : 1;

  return (
    <>
      <PageHeader
        title="Auction listings"
        description="Filter by category, status, and price. Empty filters show a clear empty state."
      />

      <div className="mb-6">
        <AuctionFilters />
      </div>

      {query.isLoading ? (
        <div className="space-y-4">
          <LoadingState label="Loading auctions…" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : null}

      {query.isError ? (
        <Alert tone="danger" title="Could not load auctions">
          {(query.error as Error).message}
        </Alert>
      ) : null}

      {query.isSuccess && query.data.items.length === 0 ? (
        <EmptyState
          title="No auctions match"
          description="Try different filters or clear them to see everything."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(clearFilters());
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : null}

      {query.isSuccess && query.data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {query.data.page} of {totalPages} · {query.data.total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default function AuctionsPage() {
  return (
    <Page>
      <ShellHeader title="Auctions" subtitle="Browse open and closed lots" />
      <Suspense fallback={<LoadingState label="Loading auctions…" />}>
        <AuctionsPageContent />
      </Suspense>
    </Page>
  );
}
