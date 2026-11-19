import type { Auction, MyBid } from './schemas/auction';

export function toMoneyNumber(value: string | number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: string | number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(toMoneyNumber(value));
}

/**
 * Minimum acceptable next bid.
 * Pass `hasBids` when bid history is known — required when the first bid equaled startingPrice.
 */
export function minNextBid(
  auction: Pick<Auction, 'startingPrice' | 'currentPrice' | 'minIncrement'>,
  hasBids = false,
): number {
  const starting = toMoneyNumber(auction.startingPrice);
  const current = toMoneyNumber(auction.currentPrice);
  const increment = toMoneyNumber(auction.minIncrement);
  if (!hasBids) {
    return starting;
  }
  return roundMoney(current + increment);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isAuctionEnded(endsAt: string | Date, now = new Date()): boolean {
  return new Date(endsAt).getTime() <= now.getTime();
}

export function formatEndsAt(endsAt: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(endsAt));
}

export function statusBadgeTone(
  status: string,
): 'neutral' | 'accent' | 'success' | 'danger' {
  switch (status) {
    case 'open':
    case 'Winning':
    case 'Won':
      return 'success';
    case 'closed':
      return 'neutral';
    case 'cancelled':
    case 'Lost':
    case 'Outbid':
      return 'danger';
    default:
      return 'accent';
  }
}

/** Keep one row per auction — prefer newest bid. */
export function dedupeMyBids(bids: MyBid[]): MyBid[] {
  const byAuction = new Map<string, MyBid>();
  for (const bid of bids) {
    const existing = byAuction.get(bid.auctionId);
    if (!existing) {
      byAuction.set(bid.auctionId, bid);
      continue;
    }
    if (new Date(bid.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      byAuction.set(bid.auctionId, bid);
    }
  }
  return [...byAuction.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const AUCTION_CATEGORIES = [
  'electronics',
  'fashion',
  'home',
  'books',
  'art',
  'other',
] as const;
