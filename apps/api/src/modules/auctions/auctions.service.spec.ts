import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { Bid } from '../bids/bids.entity';
import { Auction } from './auctions.entity';
import { AuctionsService } from './auctions.service';

const SELLER = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';
const WINNER = '33333333-3333-3333-3333-333333333333';
const AUCTION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id: AUCTION_ID,
    title: 'Vintage Camera',
    description: 'A classic camera',
    category: 'electronics',
    startingPrice: '100.00',
    minIncrement: '10.00',
    currentPrice: '100.00',
    endsAt: new Date(Date.now() + 60 * 60 * 1000),
    status: 'open',
    sellerId: SELLER,
    winnerId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Auction;
}

function makeUser(overrides: Partial<JwtUser> = {}): JwtUser {
  return {
    id: SELLER,
    email: 'staff@demo.local',
    role: 'staff',
    ...overrides,
  };
}

describe('AuctionsService', () => {
  const auctionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  };

  const bidRepository = {
    count: jest.fn(),
    findOne: jest.fn(),
  };

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

  let service: AuctionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(
      async (fn: (m: typeof manager) => Promise<unknown>) => fn(manager),
    );
    service = new AuctionsService(
      dataSource as unknown as DataSource,
      auctionsRepository as unknown as Repository<Auction>,
      bidRepository as unknown as Repository<Bid>,
    );
  });

  describe('create', () => {
    it('creates an open auction with currentPrice equal to startingPrice', async () => {
      const endsAt = new Date(Date.now() + 86_400_000).toISOString();
      const created = makeAuction();
      auctionsRepository.create.mockImplementation((data: Partial<Auction>) => data);
      auctionsRepository.save.mockResolvedValue(created);

      await service.create(
        {
          title: 'Vintage Camera',
          description: '  nice  ',
          category: 'Electronics',
          startingPrice: 100,
          minIncrement: 10,
          endsAt,
        },
        SELLER,
      );

      expect(auctionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Vintage Camera',
          description: 'nice',
          category: 'electronics',
          startingPrice: '100.00',
          minIncrement: '10.00',
          currentPrice: '100.00',
          status: 'open',
          sellerId: SELLER,
          winnerId: null,
        }),
      );
      expect(auctionsRepository.save).toHaveBeenCalled();
    });

    it('rejects a past endsAt', async () => {
      await expect(
        service.create(
          {
            title: 'Old',
            category: 'books',
            startingPrice: 50,
            minIncrement: 5,
            endsAt: new Date(Date.now() - 60_000).toISOString(),
          },
          SELLER,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.create(
          {
            title: 'Old',
            category: 'books',
            startingPrice: 50,
            minIncrement: 5,
            endsAt: new Date(Date.now() - 60_000).toISOString(),
          },
          SELLER,
        ),
      ).rejects.toThrow(/End time must be in the future/);
    });
  });

  describe('findAuctionById', () => {
    it('throws NotFound when missing or soft-deleted', async () => {
      auctionsRepository.findOne.mockResolvedValue(null);

      await expect(service.findAuctionById(AUCTION_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(service.findAuctionById(AUCTION_ID)).rejects.toThrow(
        /This auction is no longer available/,
      );
    });
  });

  describe('updateAuction', () => {
    it('forbids non-owners', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction());

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, OTHER),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects updates when the auction already has bids', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction());
      bidRepository.count.mockResolvedValue(1);

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, SELLER),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, SELLER),
      ).rejects.toThrow(/This auction already has bids/);
    });

    it('rejects updates when the auction is not open', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));
      bidRepository.count.mockResolvedValue(0);

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, SELLER),
      ).rejects.toThrow(/Only open auctions can be updated/);
    });

    it('saves updates for the owner when there are no bids', async () => {
      const auction = makeAuction();
      auctionsRepository.findOne.mockResolvedValue(auction);
      bidRepository.count.mockResolvedValue(0);
      auctionsRepository.save.mockImplementation(async (a: Auction) => a);

      const result = await service.updateAuction(
        AUCTION_ID,
        { title: 'Updated Camera', category: 'Art' },
        SELLER,
      );

      expect(auction.title).toBe('Updated Camera');
      expect(auction.category).toBe('art');
      expect(result.auction).toBe(auction);
      expect(auctionsRepository.save).toHaveBeenCalledWith(auction);
    });
  });

  describe('softDeleteAuction', () => {
    it('forbids a non-owner non-admin', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction());

      await expect(
        service.softDeleteAuction(AUCTION_ID, makeUser({ id: OTHER, role: 'staff' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows the owner to soft-delete', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction());
      auctionsRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.softDeleteAuction(AUCTION_ID, makeUser());

      expect(auctionsRepository.softDelete).toHaveBeenCalledWith(AUCTION_ID);
      expect(result.message).toMatch(/deleted/i);
    });

    it('allows an admin to soft-delete any auction', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction());
      auctionsRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteAuction(
        AUCTION_ID,
        makeUser({ id: OTHER, role: 'admin', email: 'admin@demo.local' }),
      );

      expect(auctionsRepository.softDelete).toHaveBeenCalledWith(AUCTION_ID);
    });
  });

  describe('finalizeAsClosed', () => {
    it('picks the highest bidder and uses earliest createdAt on ties', async () => {
      const auction = makeAuction();
      const auctionRepo = {
        save: jest.fn(async (a: Auction) => a),
      };
      const bidRepo = {
        findOne: jest.fn().mockResolvedValue({
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          auctionId: AUCTION_ID,
          bidderId: WINNER,
          bidAmount: '150.00',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      };

      const result = await service.finalizeAsClosed(
        auction,
        auctionRepo as unknown as Repository<Auction>,
        bidRepo as unknown as Repository<Bid>,
      );

      expect(bidRepo.findOne).toHaveBeenCalledWith({
        where: { auctionId: AUCTION_ID },
        order: { bidAmount: 'DESC', createdAt: 'ASC' },
      });
      expect(result.status).toBe('closed');
      expect(result.winnerId).toBe(WINNER);
    });

    it('sets winnerId to null when there are no bids', async () => {
      const auction = makeAuction();
      const auctionRepo = {
        save: jest.fn(async (a: Auction) => a),
      };
      const bidRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const result = await service.finalizeAsClosed(
        auction,
        auctionRepo as unknown as Repository<Auction>,
        bidRepo as unknown as Repository<Bid>,
      );

      expect(result.status).toBe('closed');
      expect(result.winnerId).toBeNull();
    });
  });

  describe('closeAuction', () => {
    it('forbids a non-owner non-admin', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction());

      await expect(
        service.closeAuction(AUCTION_ID, makeUser({ id: OTHER, role: 'staff' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('sets winnerId to the highest bidder', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne.mockResolvedValue(auction);
      txBidRepo.findOne.mockResolvedValue({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        auctionId: AUCTION_ID,
        bidderId: WINNER,
        bidAmount: '150.00',
        createdAt: new Date(),
      });
      txAuctionRepo.save.mockImplementation(async (a: Auction) => a);

      const result = await service.closeAuction(AUCTION_ID, makeUser());

      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_ID },
        lock: { mode: 'pessimistic_write' },
      });
      expect(auction.status).toBe('closed');
      expect(auction.winnerId).toBe(WINNER);
      expect(result.auction.winnerId).toBe(WINNER);
      expect(txBidRepo.findOne).toHaveBeenCalledWith({
        where: { auctionId: AUCTION_ID },
        order: { bidAmount: 'DESC', createdAt: 'ASC' },
      });
    });

    it('sets winnerId to null when there are no bids', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne.mockResolvedValue(auction);
      txBidRepo.findOne.mockResolvedValue(null);
      txAuctionRepo.save.mockImplementation(async (a: Auction) => a);

      const result = await service.closeAuction(AUCTION_ID, makeUser());

      expect(auction.status).toBe('closed');
      expect(result.auction.winnerId).toBeNull();
    });

    it('rejects closing an already closed auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));

      await expect(service.closeAuction(AUCTION_ID, makeUser())).rejects.toThrow(
        /already closed or cancelled/,
      );
    });
  });

  describe('cancelAuction', () => {
    it('cancels an open auction', async () => {
      const auction = makeAuction();
      auctionsRepository.findOne.mockResolvedValue(auction);
      auctionsRepository.save.mockImplementation(async (a: Auction) => a);

      const result = await service.cancelAuction(AUCTION_ID);

      expect(auction.status).toBe('cancelled');
      expect(result.auction.status).toBe('cancelled');
    });

    it('rejects cancelling a non-open auction', async () => {
      auctionsRepository.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));

      await expect(service.cancelAuction(AUCTION_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(service.cancelAuction(AUCTION_ID)).rejects.toThrow(
        /Only open auctions can be cancelled/,
      );
    });
  });
});
