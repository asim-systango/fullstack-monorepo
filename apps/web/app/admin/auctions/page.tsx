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
import { RequireAuth, ShellHeader } from '@/components/auth';
import { ConfirmActionDialog } from '@/components/auctions';
import { auctionQueryKeys, auctionsApi } from '@/lib/api';
import { formatMoney, statusBadgeTone } from '@/lib/auction-utils';

function AdminAuctions() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: auctionQueryKeys.list({ limit: 50, status: undefined }),
    queryFn: () => auctionsApi.list({ limit: 50 }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() });
  };

  const cancelMutation = useMutation({
    mutationFn: (id: string) => auctionsApi.cancel(id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => auctionsApi.softDelete(id),
    onSuccess: invalidate,
  });

  return (
    <Page>
      <ShellHeader title="Admin" subtitle="Moderate auction listings" />
      <PageHeader
        title="Auction management"
        description="Cancel open auctions or soft-delete any listing."
      />

      {listQuery.isLoading ? <LoadingState label="Loading auctions…" /> : null}
      {listQuery.isError ? (
        <Alert tone="danger" title="Could not load auctions">
          {(listQuery.error as Error).message}
        </Alert>
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length === 0 ? (
        <EmptyState title="No auctions" description="There is nothing to moderate." />
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
                    {auction.status === 'open' ? (
                      <ConfirmActionDialog
                        triggerLabel="Cancel"
                        triggerVariant="secondary"
                        title="Cancel this open auction?"
                        description="The auction will be cancelled and bidding will stop."
                        confirmLabel="Confirm cancel"
                        confirmVariant="secondary"
                        loadingText="Cancelling…"
                        onConfirm={() => cancelMutation.mutateAsync(auction.id)}
                      />
                    ) : null}
                    <ConfirmActionDialog
                      triggerLabel="Delete"
                      triggerVariant="danger"
                      title="Soft-delete this auction?"
                      description="It will disappear from public listings."
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

export default function AdminAuctionsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminAuctions />
    </RequireAuth>
  );
}
