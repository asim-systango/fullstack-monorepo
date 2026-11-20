'use client';

import {
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import type { Bid } from '@/lib/schemas/auction';
import { formatMoney } from '@/lib/auction-utils';

export function BidHistory({
  bids,
  winnerId,
}: Readonly<{
  bids: Bid[];
  winnerId?: string | null;
}>) {
  if (bids.length === 0) {
    return (
      <EmptyState
        title="No bids yet"
        description="Be the first to place a bid on this auction."
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Bidder</TableHeaderCell>
          <TableHeaderCell>When</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bids.map((bid) => (
          <TableRow key={bid.id}>
            <TableCell>
              {formatMoney(bid.bidAmount)}
              {winnerId && bid.bidderId === winnerId ? (
                <span className="ml-2 text-xs text-muted-foreground">(winner)</span>
              ) : null}
            </TableCell>
            <TableCell>{bid.bidderName ?? `${bid.bidderId.slice(0, 8)}…`}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(bid.createdAt).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
