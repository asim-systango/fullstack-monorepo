import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, type Repository } from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { Watchlist } from './watchlist.entity';
import { WatchlistService } from './watchlist.service';

const USER_ID = '11111111-1111-1111-1111-111111111111';
const AUCTION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

describe('WatchlistService', () => {
  const watchlistRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const auctionsRepository = {
    findOne: jest.fn(),
  };

  let service: WatchlistService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WatchlistService(
      watchlistRepository as unknown as Repository<Watchlist>,
      auctionsRepository as unknown as Repository<Auction>,
    );
  });

  describe('addWatch', () => {
    it('throws NotFound when the auction is missing', async () => {
      auctionsRepository.findOne.mockResolvedValue(null);

      await expect(service.addWatch(AUCTION_ID, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ConflictException when the auction is already watched', async () => {
      auctionsRepository.findOne.mockResolvedValue({ id: AUCTION_ID });
      watchlistRepository.findOne.mockResolvedValue({
        id: 'wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww',
        userId: USER_ID,
        auctionId: AUCTION_ID,
      });

      await expect(service.addWatch(AUCTION_ID, USER_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.addWatch(AUCTION_ID, USER_ID)).rejects.toThrow(
        /already on your watchlist/,
      );
    });

    it('maps Postgres unique violations to ConflictException', async () => {
      auctionsRepository.findOne.mockResolvedValue({ id: AUCTION_ID });
      watchlistRepository.findOne.mockResolvedValue(null);
      watchlistRepository.create.mockImplementation((data: Partial<Watchlist>) => data);

      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });
      watchlistRepository.save.mockRejectedValue(
        new QueryFailedError('INSERT', [], driverError),
      );

      await expect(service.addWatch(AUCTION_ID, USER_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.addWatch(AUCTION_ID, USER_ID)).rejects.toThrow(
        /already on your watchlist/,
      );
    });

    it('returns the saved watchlist on the happy path', async () => {
      auctionsRepository.findOne.mockResolvedValue({ id: AUCTION_ID });
      watchlistRepository.findOne.mockResolvedValue(null);
      const saved = {
        id: 'wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww',
        userId: USER_ID,
        auctionId: AUCTION_ID,
        createdAt: new Date(),
      };
      watchlistRepository.create.mockReturnValue(saved);
      watchlistRepository.save.mockResolvedValue(saved);

      const result = await service.addWatch(AUCTION_ID, USER_ID);

      expect(result.watchlist).toEqual(saved);
      expect(result.message).toMatch(/added to watchlist/i);
    });
  });
});
