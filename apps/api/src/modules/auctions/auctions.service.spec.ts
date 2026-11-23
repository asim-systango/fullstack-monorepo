import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { Bid } from '../bids/bids.entity';
import { Watchlist } from '../watchlist/watchlist.entity';
import { Auction } from './auctions.entity';
import { AuctionsService } from './auctions.service';
import { auctionsMessages } from './auctions.messages';

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
  const listQb = {
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const auctionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const bidRepository = {
    count: jest.fn(),
    findOne: jest.fn(),
  };

  const txAuctionRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };
  const txBidRepo = {
    findOne: jest.fn(),
    count: jest.fn(),
  };
  const txWatchlistRepo = {
    delete: jest.fn(),
  };
  const manager = {
    getRepository: jest.fn((entity: unknown) => {
      if (entity === Auction) return txAuctionRepo;
      if (entity === Watchlist) return txWatchlistRepo;
      return txBidRepo;
    }),
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
    listQb.andWhere.mockReturnValue(listQb);
    listQb.orderBy.mockReturnValue(listQb);
    listQb.skip.mockReturnValue(listQb);
    listQb.take.mockReturnValue(listQb);
    listQb.getManyAndCount.mockResolvedValue([[], 0]);
    auctionsRepository.createQueryBuilder.mockReturnValue(listQb);
    service = new AuctionsService(
      dataSource as unknown as DataSource,
      auctionsRepository as unknown as Repository<Auction>,
      bidRepository as unknown as Repository<Bid>,
    );
  });

  describe('findAll', () => {
    it('always omits soft-deleted auctions', async () => {
      await service.findAll({ page: 1, limit: 20 });

      expect(auctionsRepository.createQueryBuilder).toHaveBeenCalledWith('auction');
      expect(listQb.andWhere).toHaveBeenCalledWith('auction.deletedAt IS NULL');
    });

    it('applies trimmed q search on title and description', async () => {
      await service.findAll({ page: 1, limit: 20, q: '  camera  ' });

      expect(listQb.andWhere).toHaveBeenCalledWith(
        '(auction.title ILIKE :search OR auction.description ILIKE :search)',
        { search: '%camera%' },
      );
    });

    it('applies category, status, sellerId, and price filters', async () => {
      await service.findAll({
        page: 1,
        limit: 20,
        category: 'Electronics',
        status: 'open',
        sellerId: SELLER,
        minPrice: 100,
        maxPrice: 500,
      });

      expect(listQb.andWhere).toHaveBeenCalledWith('auction.category = :category', {
        category: 'electronics',
      });
      expect(listQb.andWhere).toHaveBeenCalledWith('auction.status = :status', {
        status: 'open',
      });
      expect(listQb.andWhere).toHaveBeenCalledWith('auction.sellerId = :sellerId', {
        sellerId: SELLER,
      });
      expect(listQb.andWhere).toHaveBeenCalledWith('auction.currentPrice >= :minPrice', {
        minPrice: 100,
      });
      expect(listQb.andWhere).toHaveBeenCalledWith('auction.currentPrice <= :maxPrice', {
        maxPrice: 500,
      });
    });

    it('paginates with skip/take and returns items, total, page, limit', async () => {
      const items = [makeAuction()];
      listQb.getManyAndCount.mockResolvedValue([items, 42]);

      const result = await service.findAll({ page: 3, limit: 10 });

      expect(listQb.orderBy).toHaveBeenCalledWith('auction.createdAt', 'DESC');
      expect(listQb.skip).toHaveBeenCalledWith(20);
      expect(listQb.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ items, total: 42, page: 3, limit: 10 });
    });

    it('rejects when minPrice is greater than maxPrice', async () => {
      await expect(
        service.findAll({ page: 1, limit: 20, minPrice: 500, maxPrice: 100 }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.findAll({ page: 1, limit: 20, minPrice: 500, maxPrice: 100 }),
      ).rejects.toThrow(auctionsMessages.INVALID_PRICE_RANGE);

      expect(auctionsRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
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
      txAuctionRepo.findOne.mockResolvedValue(makeAuction());

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, OTHER),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects updates when the auction already has bids', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction());
      txBidRepo.count.mockResolvedValue(1);

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, SELLER),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, SELLER),
      ).rejects.toThrow(/This auction already has bids/);
    });

    it('rejects updates when the auction is not open', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));
      txBidRepo.count.mockResolvedValue(0);

      await expect(
        service.updateAuction(AUCTION_ID, { title: 'Nope' }, SELLER),
      ).rejects.toThrow(/Only open auctions can be updated/);
    });

    it('saves updates for the owner when there are no bids', async () => {
      const auction = makeAuction();
      txAuctionRepo.findOne.mockResolvedValue(auction);
      txBidRepo.count.mockResolvedValue(0);
      txAuctionRepo.save.mockImplementation(async (a: Auction) => a);

      const result = await service.updateAuction(
        AUCTION_ID,
        { title: 'Updated Camera', category: 'Art' },
        SELLER,
      );

      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_ID },
        lock: { mode: 'pessimistic_write' },
      });
      expect(auction.title).toBe('Updated Camera');
      expect(auction.category).toBe('art');
      expect(result.auction).toBe(auction);
      expect(txAuctionRepo.save).toHaveBeenCalledWith(auction);
    });
  });

  describe('softDeleteAuction', () => {
    it('forbids a non-owner non-admin', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction());

      await expect(
        service.softDeleteAuction(AUCTION_ID, makeUser({ id: OTHER, role: 'staff' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_ID },
        lock: { mode: 'pessimistic_write' },
      });
      expect(txAuctionRepo.softDelete).not.toHaveBeenCalled();
    });

    it('rejects soft-delete of an open auction that still has bids', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'open' }));
      txBidRepo.count.mockResolvedValue(2);

      await expect(
        service.softDeleteAuction(AUCTION_ID, makeUser()),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.softDeleteAuction(AUCTION_ID, makeUser())).rejects.toThrow(
        auctionsMessages.CANNOT_DELETE_OPEN_WITH_BIDS,
      );
      expect(txAuctionRepo.softDelete).not.toHaveBeenCalled();
      expect(txWatchlistRepo.delete).not.toHaveBeenCalled();
    });

    it('allows the owner to soft-delete an open auction with no bids', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'open' }));
      txBidRepo.count.mockResolvedValue(0);
      txWatchlistRepo.delete.mockResolvedValue({ affected: 0 });
      txAuctionRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.softDeleteAuction(AUCTION_ID, makeUser());

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_ID },
        lock: { mode: 'pessimistic_write' },
      });
      expect(txWatchlistRepo.delete).toHaveBeenCalledWith({ auctionId: AUCTION_ID });
      expect(txAuctionRepo.softDelete).toHaveBeenCalledWith(AUCTION_ID);
      expect(result.message).toMatch(/deleted/i);
    });

    it('allows soft-delete of a closed auction and clears watchlist rows', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));
      txWatchlistRepo.delete.mockResolvedValue({ affected: 2 });
      txAuctionRepo.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteAuction(AUCTION_ID, makeUser());

      expect(txBidRepo.count).not.toHaveBeenCalled();
      expect(txWatchlistRepo.delete).toHaveBeenCalledWith({ auctionId: AUCTION_ID });
      expect(txAuctionRepo.softDelete).toHaveBeenCalledWith(AUCTION_ID);
    });

    it('allows an admin to soft-delete any auction without open bids', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'cancelled' }));
      txWatchlistRepo.delete.mockResolvedValue({ affected: 0 });
      txAuctionRepo.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteAuction(
        AUCTION_ID,
        makeUser({ id: OTHER, role: 'admin', email: 'admin@demo.local' }),
      );

      expect(txWatchlistRepo.delete).toHaveBeenCalledWith({ auctionId: AUCTION_ID });
      expect(txAuctionRepo.softDelete).toHaveBeenCalledWith(AUCTION_ID);
    });

    it('throws NotFound when the auction is missing', async () => {
      txAuctionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.softDeleteAuction(AUCTION_ID, makeUser()),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(txAuctionRepo.softDelete).not.toHaveBeenCalled();
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
      txAuctionRepo.findOne.mockResolvedValue(auction);
      txAuctionRepo.save.mockImplementation(async (a: Auction) => a);

      const result = await service.cancelAuction(AUCTION_ID);

      expect(txAuctionRepo.findOne).toHaveBeenCalledWith({
        where: { id: AUCTION_ID },
        lock: { mode: 'pessimistic_write' },
      });
      expect(auction.status).toBe('cancelled');
      expect(result.auction.status).toBe('cancelled');
      expect(txAuctionRepo.save).toHaveBeenCalledWith(auction);
    });

    it('rejects cancelling a non-open auction', async () => {
      txAuctionRepo.findOne.mockResolvedValue(makeAuction({ status: 'closed' }));

      await expect(service.cancelAuction(AUCTION_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(service.cancelAuction(AUCTION_ID)).rejects.toThrow(
        /Only open auctions can be cancelled/,
      );
    });
  });
});
