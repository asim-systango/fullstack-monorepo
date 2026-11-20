import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { commonMessages } from '../../common/messages';
import { Auction } from '../auctions/auctions.entity';
import { Bid } from './bids.entity';
import { bidsMessages } from './bids.messages';
import { CreateBidDto } from './dto/create-bid.dto';

function toMoneyString(value: number): string {
  return value.toFixed(2);
}

/** Convert money to integer cents to avoid float drift on numeric(10,2). */
function toCents(value: string | number): number {
  const normalized =
    typeof value === 'number' ? value.toFixed(2) : Number(value).toFixed(2);
  return Math.round(Number(normalized) * 100);
}

function centsToMoneyString(cents: number): string {
  return (cents / 100).toFixed(2);
}

@Injectable()
export class BidsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  async placeBid(auctionId: string, bidderId: string, dto: CreateBidDto) {
    return this.dataSource.transaction(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);

      const auction = await auctionRepo.findOne({
        where: { id: auctionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!auction) {
        throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
      }

      if (auction.status !== 'open') {
        throw new BadRequestException(bidsMessages.ONLY_OPEN_ACCEPT_BIDS);
      }

      if (auction.endsAt <= new Date()) {
        throw new BadRequestException(bidsMessages.AUCTION_HAS_ENDED);
      }

      if (auction.sellerId === bidderId) {
        throw new ForbiddenException(bidsMessages.CANNOT_BID_OWN);
      }

      const bidCount = await bidRepo.count({ where: { auctionId } });
      const minRequiredCents =
        bidCount === 0
          ? toCents(auction.startingPrice)
          : toCents(auction.currentPrice) + toCents(auction.minIncrement);

      if (toCents(dto.bidAmount) < minRequiredCents) {
        throw new BadRequestException(
          bidsMessages.bidTooLow(centsToMoneyString(minRequiredCents)),
        );
      }

      const bidAmount = toMoneyString(dto.bidAmount);
      const bid = bidRepo.create({
        auctionId,
        bidderId,
        bidAmount,
      });
      const savedBid = await bidRepo.save(bid);

      auction.currentPrice = bidAmount;
      await auctionRepo.save(auction);

      return {
        message: bidsMessages.CREATED_SUCCESS,
        bid: savedBid,
      };
    });
  }

  async listBids(auctionId: string) {
    const auction = await this.auctionsRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
    }
    const bids = await this.bidRepository.find({
      where: { auctionId },
      relations: { bidder: true },
      order: { bidAmount: 'DESC', createdAt: 'DESC' },
    });
    return bids.map(({ id, auctionId: aid, bidderId, bidAmount, createdAt, bidder }) => ({
      id,
      auctionId: aid,
      bidderId,
      bidAmount,
      createdAt,
      bidderName: bidder.name,
    }));
  }

  async myBids(bidderId: string) {
    const bids = await this.bidRepository.find({
      where: { bidderId },
      relations: { auction: true },
      order: { createdAt: 'DESC' },
    });

    // One row per auction (latest bid); skip soft-deleted / missing auctions.
    const latestByAuctionId = new Map<string, (typeof bids)[number]>();
    for (const bid of bids) {
      if (!bid.auction) {
        continue;
      }
      if (!latestByAuctionId.has(bid.auctionId)) {
        latestByAuctionId.set(bid.auctionId, bid);
      }
    }

    const uniqueBids = [...latestByAuctionId.values()];
    const auctionIds = uniqueBids.map((bid) => bid.auctionId);

    const highestBidMap = new Map<string, string>();
    if (auctionIds.length > 0) {
      const highestRows = await this.bidRepository
        .createQueryBuilder('bid')
        .select(['bid.auctionId', 'bid.bidderId'])
        .distinctOn(['bid.auctionId'])
        .where('bid.auctionId IN (:...auctionIds)', { auctionIds })
        .orderBy('bid.auctionId', 'ASC')
        .addOrderBy('bid.bidAmount', 'DESC')
        .addOrderBy('bid.createdAt', 'DESC')
        .getMany();

      for (const bid of highestRows) {
        highestBidMap.set(bid.auctionId, bid.bidderId);
      }
    }

    return uniqueBids.map((bid) => {
      const auction = bid.auction;

      let status: string;

      if (auction.status === 'closed') {
        status = auction.winnerId === bidderId ? 'Won' : 'Lost';
      } else if (auction.status === 'cancelled') {
        status = 'Lost';
      } else if (auction.status === 'open') {
        status = highestBidMap.get(bid.auctionId) === bidderId ? 'Winning' : 'Outbid';
      } else {
        status = 'Pending';
      }

      return {
        ...bid,
        status,
      };
    });
  }
}
