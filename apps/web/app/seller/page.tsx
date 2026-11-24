'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader, useAuth } from '@/components/auth';
import { CloseAuctionDialog, ConfirmActionDialog } from '@/components/auctions';
import { ButtonLink } from '@/components/ui/button-link';
import { auctionQueryKeys, auctionsApi } from '@/lib/api';
import { formatMoney, statusBadgeTone } from '@/lib/auction-utils';

function SellerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: auctionQueryKeys.dashboard(),
    queryFn: () => auctionsApi.dashboard(),
  });

  const listQuery = useQuery({
    queryKey: auctionQueryKeys.list({ sellerId: user?.id, limit: 50 }),
    queryFn: () => auctionsApi.list({ sellerId: user?.id, limit: 50 }),
    enabled: Boolean(user?.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => auctionsApi.softDelete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.dashboard() }),
      ]);
    },
  });

  return (
    <Page>
      <ShellHeader title="Seller" subtitle="Manage your auctions" />
      <PageHeader
        title="Seller dashboard"
        description="Open lots, total bids received, and items sold."
        actions={<ButtonLink href="/seller/auctions/new">New auction</ButtonLink>}
      />

      {dashboardQuery.isLoading ? <LoadingState label="Loading dashboard…" /> : null}
      {dashboardQuery.isError ? (
        <Alert tone="danger" title="Dashboard unavailable">
          {(dashboardQuery.error as Error).message}
        </Alert>
      ) : null}
      {dashboardQuery.data ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Open auctions</p>
            <p className="text-2xl font-medium">{dashboardQuery.data.openAuctions}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total bids</p>
            <p className="text-2xl font-medium">{dashboardQuery.data.totalBids}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Items sold</p>
            <p className="text-2xl font-medium">{dashboardQuery.data.itemsSold}</p>
          </div>
        </div>
      ) : null}

      <h2 className="mb-3 text-lg font-medium">My auctions</h2>
      {listQuery.isLoading ? <LoadingState label="Loading your auctions…" /> : null}
      {listQuery.isError ? (
        <Alert tone="danger" title="Could not load auctions">
          {(listQuery.error as Error).message}
        </Alert>
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length === 0 ? (
        <EmptyState
          title="No auctions yet"
          description="Create your first listing to start receiving bids."
          action={<ButtonLink href="/seller/auctions/new">Create auction</ButtonLink>}
        />
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listQuery.data.items.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>
                  <Link href={`/auctions/${auction.id}`}>{auction.title}</Link>
                </TableCell>
                <TableCell>
                  <Badge tone={statusBadgeTone(auction.status)}>{auction.status}</Badge>
                </TableCell>
                <TableCell>{formatMoney(auction.currentPrice)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink
                      href={`/seller/auctions/${auction.id}/edit`}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </ButtonLink>
                    {auction.status === 'open' ? (
                      <CloseAuctionDialog auctionId={auction.id} />
                    ) : null}
                    <ConfirmActionDialog
                      triggerLabel="Delete"
                      triggerVariant="danger"
                      title="Soft-delete this auction?"
                      description="It will disappear from public lists."
                      confirmLabel="Delete"
                      confirmVariant="danger"
                      loadingText="Deleting…"
                      onConfirm={() => deleteMutation.mutateAsync(auction.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Page>
  );
}

export default function SellerPage() {
  return (
    <RequireAuth roles={['staff']}>
      <SellerDashboard />
    </RequireAuth>
  );
}
