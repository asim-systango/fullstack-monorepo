'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Alert, LoadingState, Page, PageHeader } from '@shared/ui/components';
import { RequireAuth, ShellHeader, useAuth } from '@/components/auth';
import { AuctionForm } from '@/components/auctions';
import { auctionQueryKeys, auctionsApi, bidQueryKeys, bidsApi } from '@/lib/api';

function EditAuctionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
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
    queryFn: () => bidsApi.listForAuction(id),
    enabled: Boolean(id) && auctionQuery.isSuccess,
  });

  if (auctionQuery.isLoading) {
    return (
      <Page>
        <ShellHeader title="Edit auction" />
        <LoadingState label="Loading auction…" />
      </Page>
    );
  }

  if (auctionQuery.isError || !auctionQuery.data) {
    const status = (auctionQuery.error as { statusCode?: number } | null)?.statusCode;
    return (
      <Page>
        <ShellHeader title="Edit auction" />
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
            <Link href="/seller">Back to seller dashboard</Link>
          </p>
        </Alert>
      </Page>
    );
  }

  const auction = auctionQuery.data;
  if (user && auction.sellerId !== user.id) {
    return (
      <Page>
        <ShellHeader title="Edit auction" />
        <Alert tone="danger" title="Access denied">
          You can only edit your own auctions.
        </Alert>
      </Page>
    );
  }

  const hasBids = (bidsQuery.data?.length ?? 0) > 0;
  const locked = hasBids || auction.status !== 'open';
  let lockReason: string | undefined;
  if (hasBids) {
    lockReason = 'This auction already has bids, so details cannot be changed.';
  } else if (auction.status !== 'open') {
    lockReason = 'Only open auctions can be edited.';
  }

  return (
    <Page>
      <ShellHeader title="Edit auction" />
      <PageHeader
        title={`Edit: ${auction.title}`}
        description="Fields lock after the first bid or when the auction is no longer open."
      />
      {bidsQuery.isLoading ? <LoadingState label="Checking bids…" /> : null}
      <AuctionForm
        initial={auction}
        locked={locked}
        lockReason={lockReason}
        submitLabel="Save changes"
        onSubmit={async (input) => {
          await auctionsApi.update(id, input);
          router.push(`/auctions/${id}`);
        }}
      />
    </Page>
  );
}

export default function EditAuctionRoute() {
  return (
    <RequireAuth roles={['staff']}>
      <EditAuctionPage />
    </RequireAuth>
  );
}
