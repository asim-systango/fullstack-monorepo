import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { Bid } from './bids.entity';
import { BidsService } from './bids.service';

const SELLER = '11111111-1111-1111-1111-111111111111';
const BIDDER = '22222222-2222-2222-2222-222222222222';
const AUCTION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  const auction = {
    id: AUCTION_ID,
    title: 'Vintage Camera',
    description: 'A classic camera',
    category: 'electronics',
    startingPrice: '100.00',
    minIncrement: '10.00',
    currentPrice: '100.00',
    endsAt: new Date(Date.now() + 60 * 60 * 1000),
    status: 'open' as const,
    sellerId: SELLER,
    winnerId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  return auction as Auction;
}

describe('BidsService', () => {
  const txAuctionRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const txBidRepo = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const manager = {
    getRepository: jest.fn((entity: unknown) =>
      entity === Auction ? txAuctionRepo : txBidRepo,
    ),
  };

  const dataSource = {
    transaction: jest.fn(async (fn: (m: typeof manager) => Promise<unknown>) =>
      fn(manager),
    ),
  };

  const auctionsRepository = {
    findOne: jest.fn(),
  };

  const bidRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  let service: BidsService;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(
      async (fn: (m: typeof manager) => Promise<unknown>) => fn(manager),
    );
    service = new BidsService(
      dataSource as unknown as DataSource,
      auctionsRepository as unknown as Repository<Auction>,
      bidRepository as unknown as Repository<Bid>,
    );
  });

  describe('placeBid', () => {
    it('accepts the first bid at startingPrice and updates currentPrice', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne.mockResolvedValue(auction);
      txBidRepo.count.mockResolvedValue(0);
      const savedBid = {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        auctionId: AUCTION_ID,
        bidderId: BIDDER,
        bidAmount: '100.00',
        createdAt: new Date(),
      };
      txBidRepo.create.mockReturnValue(savedBid);
      txBidRepo.save.mockResolvedValue(savedBid);
      txAuctionRepo.save.mockImplementation(async (a: Auction) => a);

      const result = await service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 });

      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_ID },
        lock: { mode: 'pessimistic_write' },
      });
      expect(txBidRepo.create).toHaveBeenCalledWith({
        auctionId: AUCTION_ID,
        bidderId: BIDDER,
        bidAmount: '100.00',
      });
      expect(auction.currentPrice).toBe('100.00');
      expect(txAuctionRepo.save).toHaveBeenCalledWith(auction);
      expect(result.bid).toEqual(savedBid);
    });

    it('accepts a later bid at currentPrice + minIncrement', async () => {
      const auction = makeAuction({ currentPrice: '100.00' });
      txAuctionRepo.findOne.mockResolvedValue(auction);
      txBidRepo.count.mockResolvedValue(1);
      const savedBid = {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        auctionId: AUCTION_ID,
        bidderId: BIDDER,
        bidAmount: '110.00',
        createdAt: new Date(),
      };
      txBidRepo.create.mockReturnValue(savedBid);
      txBidRepo.save.mockResolvedValue(savedBid);
      txAuctionRepo.save.mockImplementation(async (a: Auction) => a);

      const result = await service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 110 });

      expect(auction.currentPrice).toBe('110.00');
      expect(txAuctionRepo.save).toHaveBeenCalledWith(auction);
      expect(result.bid.bidAmount).toBe('110.00');
    });

    it('rejects a first bid below startingPrice', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction());
      txBidRepo.count.mockResolvedValue(0);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 99.99 }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 99.99 }),
      ).rejects.toThrow(/Bid must be at least 100\.00/);
    });

    it('rejects a later bid below currentPrice + minIncrement', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ currentPrice: '100.00' }));
      txBidRepo.count.mockResolvedValue(1);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 109.99 }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 109.99 }),
      ).rejects.toThrow(/Bid must be at least 110\.00/);
    });

    it('rejects bids on a closed auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toThrow(/Only open auctions accept bids/);
    });

    it('rejects bids on a cancelled auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'cancelled' }));

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toThrow(/Only open auctions accept bids/);
    });

    it('rejects bids after endsAt', async () => {
      txAuctionRepo.findOne.mockResolvedValue(
        makeAuction({ endsAt: new Date(Date.now() - 60_000) }),
      );

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toThrow(/This auction has ended/);
    });

    it('forbids the seller from bidding on their own auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction());

      await expect(
        service.placeBid(AUCTION_ID, SELLER, { bidAmount: 100 }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      await expect(
        service.placeBid(AUCTION_ID, SELLER, { bidAmount: 100 }),
      ).rejects.toThrow(/You cannot bid on your own auction/);
    });

    it('returns NotFound when the auction is missing', async () => {
      txAuctionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toBeInstanceOf(NotFoundException);

      await expect(
        service.placeBid(AUCTION_ID, BIDDER, { bidAmount: 100 }),
      ).rejects.toThrow(/This auction is no longer available/);
    });
  });

  describe('listBids', () => {
    it('returns NotFound when the auction is missing', async () => {
      auctionsRepository.findOne.mockResolvedValue(null);

      await expect(service.listBids(AUCTION_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
