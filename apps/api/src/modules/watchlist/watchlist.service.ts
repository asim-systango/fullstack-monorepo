import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { Watchlist } from './watchlist.entity';

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
      throw new NotFoundException('This auction is no longer available');
    }

    const existing = await this.watchlistRepository.findOne({
      where: { userId, auctionId },
    });
    if (existing) {
      throw new ConflictException('Auction is already on your watchlist');
    }

    const watchlist = this.watchlistRepository.create({
      userId,
      auctionId,
    });
    const saved = await this.watchlistRepository.save(watchlist);

    return {
      message: 'Auction added to watchlist',
      watchlist: saved,
    };
  }

  async removeWatch(auctionId: string, userId: string) {
    const existing = await this.watchlistRepository.findOne({
      where: { userId, auctionId },
    });
    if (!existing) {
      throw new NotFoundException('Auction is not on your watchlist');
    }

    await this.watchlistRepository.remove(existing);

    return {
      message: 'Auction removed from watchlist',
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
