import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { commonMessages } from '../../common/messages';
import { Auction } from '../auctions/auctions.entity';
import { Watchlist } from './watchlist.entity';
import { watchlistMessages } from './watchlist.messages';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,

    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,
  ) {}

  async addWatch(auctionId: string, userId: string) {
    const auction = await this.auctionsRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
    }

    const existing = await this.watchlistRepository.findOne({
      where: { userId, auctionId },
    });
    if (existing) {
      throw new ConflictException(watchlistMessages.ALREADY_ON_WATCHLIST);
    }

    const watchlist = this.watchlistRepository.create({
      userId,
      auctionId,
    });
    try {
      const saved = await this.watchlistRepository.save(watchlist);
      return {
        message: watchlistMessages.ADDED_SUCCESS,
        watchlist: saved,
      };
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(watchlistMessages.ALREADY_ON_WATCHLIST);
      }
      throw err;
    }
  }

  async removeWatch(auctionId: string, userId: string) {
    const existing = await this.watchlistRepository.findOne({
      where: { userId, auctionId },
    });
    if (!existing) {
      throw new NotFoundException(watchlistMessages.NOT_ON_WATCHLIST);
    }

    await this.watchlistRepository.remove(existing);

    return {
      message: watchlistMessages.REMOVED_SUCCESS,
      auctionId,
    };
  }

  async getMyWatchlist(userId: string) {
    return this.watchlistRepository.find({
      where: { userId },
      relations: { auction: true },
      order: { createdAt: 'DESC' },
    });
  }
}
