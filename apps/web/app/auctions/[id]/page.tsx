'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  LoadingState,
  Page,
  PageHeader,
} from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import {
  BidForm,
  BidHistory,
  CloseAuctionDialog,
  WatchButton,
} from '@/components/auctions';
import { ButtonLink } from '@/components/ui/button-link';
import { auctionQueryKeys, auctionsApi, bidQueryKeys, bidsApi } from '@/lib/api';
import {
  formatEndsAt,
  formatMoney,
  isAuctionEnded,
  statusBadgeTone,
} from '@/lib/auction-utils';

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const auctionQuery = useQuery({
    queryKey: auctionQueryKeys.detail(id),
    queryFn: () => auctionsApi.getById(id),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      if ((error as { statusCode?: number }).statusCode === 404) return false;
      return failureCount < 1;
    },
  });

  const bidsQuery = useQuery({
    queryKey: bidQueryKeys.forAuction(id),
    queryFn: () => bidsApi.listForAuction(id, { limit: 100 }),
    enabled: Boolean(id) && auctionQuery.isSuccess,
  });

  if (auctionQuery.isLoading) {
    return (
      <Page>
        <ShellHeader title="Auction" />
        <LoadingState label="Loading auction…" />
      </Page>
    );
  }

  if (auctionQuery.isError || !auctionQuery.data) {
    const status = (auctionQuery.error as { statusCode?: number } | null)?.statusCode;
    return (
      <Page>
        <ShellHeader title="Auction" />
        <Alert
          tone="danger"
          title={
            status === 404
              ? 'This auction is no longer available'
              : 'Could not load auction'
          }
        >
          {(auctionQuery.error as Error | null)?.message ?? 'Auction not found'}
          <p className="mt-2">
            <Link href="/auctions">Back to listings</Link>
          </p>
        </Alert>
      </Page>
    );
  }

  const auction = auctionQuery.data;
  const bids = bidsQuery.data ?? [];
  const ended = isAuctionEnded(auction.endsAt);
  const isSeller = user?.id === auction.sellerId;
  const canBid =
    user?.role === 'user' && auction.status === 'open' && !ended && !isSeller;
  const canClose =
    auction.status === 'open' &&
    ((user?.role === 'staff' && isSeller) || user?.role === 'admin');
  const canEdit = user?.role === 'staff' && isSeller && auction.status === 'open';
  const hasBids = bids.length > 0;
  const winnerName = auction.winnerId
    ? bids.find((bid) => bid.bidderId === auction.winnerId)?.bidderName
    : undefined;

  return (
    <Page>
      <ShellHeader title="Auction detail" />
      <PageHeader
        title={auction.title}
        description={auction.description ?? 'No description provided.'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusBadgeTone(auction.status)}>{auction.status}</Badge>
            {canEdit && !hasBids ? (
              <ButtonLink
                href={`/seller/auctions/${auction.id}/edit`}
                variant="secondary"
                size="sm"
              >
                Edit
              </ButtonLink>
            ) : null}
            {canEdit && hasBids ? (
              <>
                <Button variant="secondary" size="sm" disabled>
                  Edit
                </Button>
                <span className="text-xs text-muted-foreground">
                  Editing locked — this auction has bids
                </span>
              </>
            ) : null}
            {canClose ? <CloseAuctionDialog auctionId={auction.id} /> : null}
          </div>
        }
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-muted-foreground">Category </span>
            <span className="capitalize">{auction.category}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Current price </span>
            <strong>{formatMoney(auction.currentPrice)}</strong>
          </p>
          <p>
            <span className="text-muted-foreground">Starting </span>
            {formatMoney(auction.startingPrice)}
            <span className="text-muted-foreground"> · Increment </span>
            {formatMoney(auction.minIncrement)}
          </p>
          <p>
            <span className="text-muted-foreground">Ends </span>
            {formatEndsAt(auction.endsAt)}
            {ended && auction.status === 'open' ? (
              <span className="ml-2 text-destructive">This auction has ended</span>
            ) : null}
          </p>
          {auction.status === 'closed' ? (
            <Alert tone="success" title="Auction closed">
              {auction.winnerId
                ? `Won by ${winnerName ?? 'bidder'}`
                : 'Closed with no bids.'}
            </Alert>
          ) : null}
          {auction.status === 'cancelled' ? (
            <Alert tone="danger" title="Cancelled">
              This auction was cancelled by an admin.
            </Alert>
          ) : null}
          <WatchButton auctionId={auction.id} />
          {!user ? (
            <p className="text-sm text-muted-foreground">
              <Link href={`/login?next=${encodeURIComponent('/auctions/' + id)}`}>
                Log in
              </Link>{' '}
              as a bidder to place a bid.
            </p>
          ) : null}
          {isSeller ? (
            <Alert tone="info" title="You are the seller">
              You cannot bid on your own auction.
            </Alert>
          ) : null}
        </div>

        <div>
          {canBid ? <BidForm auction={auction} hasBids={hasBids} /> : null}
          {user?.role === 'user' && !canBid && (auction.status !== 'open' || ended) ? (
            <Alert tone="neutral" title="Bidding closed">
              The bid form is hidden because this auction is not accepting bids.
            </Alert>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Bid history</h2>
          {bidsQuery.isFetching ? (
            <span className="text-xs text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>
        {bidsQuery.isLoading ? <LoadingState label="Loading bids…" /> : null}
        {bidsQuery.isError ? (
          <Alert tone="danger" title="Could not load bids">
            {(bidsQuery.error as Error).message}
          </Alert>
        ) : null}
        {bidsQuery.isSuccess ? (
          <BidHistory bids={bids} winnerId={auction.winnerId} />
        ) : null}
      </section>

      <p className="mt-8 text-sm">
        <Link href="/auctions">← Back to listings</Link>
      </p>
    </Page>
  );
}
