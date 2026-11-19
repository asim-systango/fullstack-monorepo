'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Badge,
  Button,
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
import { CloseAuctionDialog } from '@/components/auctions';
import { auctionQueryKeys, auctionsApi } from '@/lib/api';
import { formatMoney, statusBadgeTone } from '@/lib/auction-utils';
import { useState } from 'react';

function SellerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

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
      setActionError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.dashboard() }),
      ]);
    },
    onError: (err) => {
      setActionError(err instanceof ApiClientError ? err.message : 'Delete failed');
    },
  });

  return (
    <Page>
      <ShellHeader title="Seller" subtitle="Manage your auctions" />
      <PageHeader
        title="Seller dashboard"
        description="Open lots, total bids received, and items sold."
        actions={
          <Link
            href="/seller/auctions/new"
            className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
          >
            New auction
          </Link>
        }
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

      {actionError ? (
        <Alert tone="danger" title="Action failed">
          {actionError}
        </Alert>
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
          action={
            <Link
              href="/seller/auctions/new"
              className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
            >
              Create auction
            </Link>
          }
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
                    <Link
                      href={`/seller/auctions/${auction.id}/edit`}
                      className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
                    >
                      Edit
                    </Link>
                    {auction.status === 'open' ? (
                      <CloseAuctionDialog auctionId={auction.id} />
                    ) : null}
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleteMutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            'Soft-delete this auction? It will disappear from public lists.',
                          )
                        ) {
                          deleteMutation.mutate(auction.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
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
