import {
  dedupeMyBids,
  formatMoney,
  isAuctionEnded,
  minNextBid,
  toMoneyNumber,
} from './auction-utils';
import type { Auction, MyBid } from './schemas/auction';

const baseAuction: Pick<Auction, 'startingPrice' | 'currentPrice' | 'minIncrement'> = {
  startingPrice: '500.00',
  currentPrice: '500.00',
  minIncrement: '50.00',
};

describe('auction-utils', () => {
  it('parses money strings', () => {
    expect(toMoneyNumber('650.00')).toBe(650);
  });

  it('formats INR currency', () => {
    expect(formatMoney('500.00')).toContain('500');
  });

  it('computes min next bid for first vs later bids', () => {
    expect(minNextBid(baseAuction, false)).toBe(500);
    expect(minNextBid({ ...baseAuction, currentPrice: '650.00' }, true)).toBe(700);
  });

  it('detects ended auctions', () => {
    expect(isAuctionEnded('2000-01-01T00:00:00.000Z')).toBe(true);
    expect(isAuctionEnded('2099-01-01T00:00:00.000Z')).toBe(false);
  });

  it('dedupes my bids by auction keeping newest', () => {
    const older = {
      id: '1',
      auctionId: 'a1',
      bidderId: 'u1',
      bidAmount: '100.00',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'Outbid',
      auction: { id: 'a1', title: 'Lot' } as Auction,
    } as MyBid;
    const newer = {
      ...older,
      id: '2',
      bidAmount: '150.00',
      createdAt: '2026-01-02T00:00:00.000Z',
      status: 'Winning',
    };
    const other = {
      ...older,
      id: '3',
      auctionId: 'a2',
      auction: { id: 'a2', title: 'Other' } as Auction,
    };
    const result = dedupeMyBids([older, newer, other]);
    expect(result).toHaveLength(2);
    expect(result.find((b) => b.auctionId === 'a1')?.bidAmount).toBe('150.00');
  });
});
