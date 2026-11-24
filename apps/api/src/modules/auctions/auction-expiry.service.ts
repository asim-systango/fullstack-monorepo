import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { Auction } from './auctions.entity';
import { AuctionsService } from './auctions.service';
import { Bid } from '../bids/bids.entity';

@Injectable()
export class AuctionExpiryService {
  private readonly logger = new Logger(AuctionExpiryService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    private readonly auctionsService: AuctionsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredAuctions(): Promise<void> {
    this.logger.debug('Auction expiry cron started');

    const now = new Date();
    const expired = await this.auctionsRepository.find({
      where: {
        status: 'open',
        endsAt: LessThanOrEqual(now),
      },
      select: { id: true },
    });

    this.logger.debug(`Found ${expired.length} expired open auction(s)`);

    for (const { id } of expired) {
      try {
        const closed = await this.closeOneExpired(id);
        if (closed) {
          this.logger.log(`Closed expired auction ${id}`);
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to close auction ${id}: ${detail}`);
      }
    }

    this.logger.debug('Auction expiry cron completed');
  }

  /**
   * Lock one auction, recheck eligibility, then finalize as closed.
   * Returns true when the auction was closed in this call.
   */
  async closeOneExpired(id: string): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);

      const auction = await auctionRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!auction) {
        return false;
      }

      const now = new Date();
      if (auction.status !== 'open' || auction.endsAt > now) {
        return false;
      }

      await this.auctionsService.finalizeAsClosed(auction, auctionRepo, bidRepo);
      return true;
    });
  }
}
