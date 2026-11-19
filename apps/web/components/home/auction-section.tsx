'use client';

import Link from 'next/link';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert, Button, EmptyState } from '@shared/ui/components';
import { AuctionCard, AuctionCardSkeleton } from '@/components/auctions';
import type { Auction, AuctionListResponse } from '@/lib/schemas/auction';

export function AuctionSection({
  id,
  title,
  description,
  viewAllHref = '/auctions',
  auctions,
  query,
  onCountdownEnded,
}: Readonly<{
  id: string;
  title: string;
  description: string;
  viewAllHref?: string;
  auctions: Auction[];
  query: UseQueryResult<AuctionListResponse, Error>;
  onCountdownEnded?: () => void;
}>) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id} className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href={viewAllHref}
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          View All Auctions
        </Link>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <AuctionCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {query.isError ? (
        <Alert tone="danger" title="Could not load auctions">
          <p className="mb-3">{query.error.message}</p>
          <Button variant="secondary" size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {query.isSuccess && auctions.length === 0 ? (
        <EmptyState
          title="No auctions available"
          description="Check back soon for new open lots, or browse the full listings."
          action={
            <Link
              href="/auctions"
              className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
            >
              Browse Auctions
            </Link>
          }
        />
      ) : null}

      {query.isSuccess && auctions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              showCountdown
              onCountdownEnded={onCountdownEnded}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
