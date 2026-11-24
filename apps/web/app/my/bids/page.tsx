'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
import { bidQueryKeys, bidsApi } from '@/lib/api';
import { formatMoney, statusBadgeTone } from '@/lib/auction-utils';

function MyBidsPage() {
  const query = useQuery({
    queryKey: bidQueryKeys.me(),
    queryFn: () => bidsApi.me({ limit: 100 }),
  });

  const rows = query.data ?? [];

  return (
    <Page>
      <ShellHeader title="My bids" subtitle="Auctions you have bid on" />
      <PageHeader
        title="Bid history"
        description="One row per auction with Winning, Outbid, Won, or Lost status."
      />

      {query.isLoading ? <LoadingState label="Loading your bids…" /> : null}
      {query.isError ? (
        <Alert tone="danger" title="Could not load bids">
          {(query.error as Error).message}
        </Alert>
      ) : null}
      {query.isSuccess && rows.length === 0 ? (
        <EmptyState
          title="No bids yet"
          description="Browse open auctions and place your first bid."
          action={<Link href="/auctions">Browse auctions</Link>}
        />
      ) : null}
      {query.isSuccess && rows.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Auction</TableHeaderCell>
              <TableHeaderCell>Your bid</TableHeaderCell>
              <TableHeaderCell>Current</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((bid) => (
              <TableRow key={bid.auctionId}>
                <TableCell>
                  <Link href={`/auctions/${bid.auctionId}`}>{bid.auction.title}</Link>
                </TableCell>
                <TableCell>{formatMoney(bid.bidAmount)}</TableCell>
                <TableCell>{formatMoney(bid.auction.currentPrice)}</TableCell>
                <TableCell>
                  <Badge tone={statusBadgeTone(bid.status)}>{bid.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Page>
  );
}

export default function MyBidsRoute() {
  return (
    <RequireAuth roles={['user']}>
      <MyBidsPage />
    </RequireAuth>
  );
}
