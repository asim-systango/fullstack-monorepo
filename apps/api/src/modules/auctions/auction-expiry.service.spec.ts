import type { DataSource, Repository } from 'typeorm';
import { FindOperator } from 'typeorm';
import { Bid } from '../bids/bids.entity';
import { Auction } from './auctions.entity';
import { AuctionsService } from './auctions.service';
import { AuctionExpiryService } from './auction-expiry.service';

const AUCTION_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const AUCTION_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const WINNER = '33333333-3333-3333-3333-333333333333';
const EARLY_BIDDER = '44444444-4444-4444-4444-444444444444';

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id: AUCTION_A,
    title: 'Vintage Camera',
    description: 'A classic camera',
    category: 'electronics',
    startingPrice: '100.00',
    minIncrement: '10.00',
    currentPrice: '100.00',
    endsAt: new Date(Date.now() - 60_000),
    status: 'open',
    sellerId: '11111111-1111-1111-1111-111111111111',
    winnerId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Auction;
}

describe('AuctionExpiryService', () => {
  const txAuctionRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const txBidRepo = {
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
    find: jest.fn(),
  };
  const auctionsService = {
    finalizeAsClosed: jest.fn(),
  };

  let service: AuctionExpiryService;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(
      async (fn: (m: typeof manager) => Promise<unknown>) => fn(manager),
    );
    service = new AuctionExpiryService(
      dataSource as unknown as DataSource,
      auctionsRepository as unknown as Repository<Auction>,
      auctionsService as unknown as AuctionsService,
    );
    logSpy = jest.spyOn(
      (service as unknown as { logger: { log: () => void } }).logger,
      'log',
    );
    errorSpy = jest.spyOn(
      (service as unknown as { logger: { error: () => void } }).logger,
      'error',
    );
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('closeOneExpired', () => {
    it('closes an expired open auction with a winner', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne.mockResolvedValue(auction);
      auctionsService.finalizeAsClosed.mockImplementation(async (a: Auction) => {
        a.status = 'closed';
        a.winnerId = WINNER;
        return a;
      });

      const closed = await service.closeOneExpired(AUCTION_A);

      expect(closed).toBe(true);
      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_A },
        lock: { mode: 'pessimistic_write' },
      });
      expect(auctionsService.finalizeAsClosed).toHaveBeenCalledWith(
        auction,
        txAuctionRepo,
        txBidRepo,
      );
    });

    it('closes an expired open auction with no bids (winnerId null)', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne.mockResolvedValue(auction);
      auctionsService.finalizeAsClosed.mockImplementation(async (a: Auction) => {
        a.status = 'closed';
        a.winnerId = null;
        return a;
      });

      const closed = await service.closeOneExpired(AUCTION_A);

      expect(closed).toBe(true);
      expect(auctionsService.finalizeAsClosed).toHaveBeenCalled();
    });

    it('skips an auction whose endsAt is still in the future', async () => {
      txAuctionRepo.findOne.mockResolvedValue(
        makeAuction({ endsAt: new Date(Date.now() + 60_000) }),
      );

      const closed = await service.closeOneExpired(AUCTION_A);

      expect(closed).toBe(false);
      expect(auctionsService.finalizeAsClosed).not.toHaveBeenCalled();
    });

    it('skips an already closed auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));

      const closed = await service.closeOneExpired(AUCTION_A);

      expect(closed).toBe(false);
      expect(auctionsService.finalizeAsClosed).not.toHaveBeenCalled();
    });

    it('skips a cancelled auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'cancelled' }));

      const closed = await service.closeOneExpired(AUCTION_A);

      expect(closed).toBe(false);
      expect(auctionsService.finalizeAsClosed).not.toHaveBeenCalled();
    });

    it('skips when the auction row is missing (e.g. soft-deleted)', async () => {
      txAuctionRepo.findOne.mockResolvedValue(null);

      const closed = await service.closeOneExpired(AUCTION_A);

      expect(closed).toBe(false);
      expect(auctionsService.finalizeAsClosed).not.toHaveBeenCalled();
    });

    it('second concurrent close attempt does not finalize again', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne
        .mockResolvedValueOnce(auction)
        .mockResolvedValueOnce(makeAuction({ status: 'closed', winnerId: WINNER }));
      auctionsService.finalizeAsClosed.mockImplementation(async (a: Auction) => {
        a.status = 'closed';
        a.winnerId = WINNER;
        return a;
      });

      const first = await service.closeOneExpired(AUCTION_A);
      const second = await service.closeOneExpired(AUCTION_A);

      expect(first).toBe(true);
      expect(second).toBe(false);
      expect(auctionsService.finalizeAsClosed).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeExpiredAuctions', () => {
    it('does not include soft-deleted auctions in the candidate query', async () => {
      auctionsRepository.find.mockResolvedValue([]);

      await service.closeExpiredAuctions();

      expect(auctionsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'open',
            endsAt: expect.any(Object),
          }),
          select: { id: true },
        }),
      );
      const call = auctionsRepository.find.mock.calls[0][0];
      expect(call.where.endsAt).toBeInstanceOf(FindOperator);
      expect(call.where.endsAt.type).toBe('lessThanOrEqual');
    });

    it('continues processing when one auction fails', async () => {
      auctionsRepository.find.mockResolvedValue([{ id: AUCTION_A }, { id: AUCTION_B }]);

      const closeOneSpy = jest
        .spyOn(service, 'closeOneExpired')
        .mockRejectedValueOnce(new Error('db boom'))
        .mockResolvedValueOnce(true);

      await service.closeExpiredAuctions();

      expect(closeOneSpy).toHaveBeenCalledWith(AUCTION_A);
      expect(closeOneSpy).toHaveBeenCalledWith(AUCTION_B);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(AUCTION_A));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(AUCTION_B));
      expect(logSpy).toHaveBeenCalledWith('Auction expiry cron completed');

      closeOneSpy.mockRestore();
    });

    it('uses earliest createdAt when finalize selects among equal amounts', async () => {
      const auctionsServiceReal = new AuctionsService(
        dataSource as unknown as DataSource,
        auctionsRepository as unknown as Repository<Auction>,
        { findOne: jest.fn() } as unknown as Repository<Bid>,
      );
      const bidRepo = {
        findOne: jest.fn().mockResolvedValue({
          bidderId: EARLY_BIDDER,
          bidAmount: '150.00',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      };
      const auctionRepo = {
        save: jest.fn(async (a: Auction) => a),
      };

      const result = await auctionsServiceReal.finalizeAsClosed(
        makeAuction(),
        auctionRepo as unknown as Repository<Auction>,
        bidRepo as unknown as Repository<Bid>,
      );

      expect(bidRepo.findOne).toHaveBeenCalledWith({
        where: { auctionId: AUCTION_A },
        order: { bidAmount: 'DESC', createdAt: 'ASC' },
      });
      expect(result.winnerId).toBe(EARLY_BIDDER);
    });
  });
});
