import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { Bid } from './bids.entity';
import { CreateBidDto } from './dto/create-bid.dto';

function toMoneyString(value: number): string {
  return value.toFixed(2);
}

function toMoneyNumber(value: string): number {
  return Number(value);
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
        throw new NotFoundException('This auction is no longer available');
      }

      if (auction.status !== 'open') {
        throw new BadRequestException('Only open auctions accept bids');
      }

      if (auction.endsAt <= new Date()) {
        throw new BadRequestException('This auction has ended');
      }

      if (auction.sellerId === bidderId) {
        throw new ForbiddenException('You cannot bid on your own auction');
      }

      const bidCount = await bidRepo.count({ where: { auctionId } });
      const startingPrice = toMoneyNumber(auction.startingPrice);
      const currentPrice = toMoneyNumber(auction.currentPrice);
      const minIncrement = toMoneyNumber(auction.minIncrement);

      const minRequired = bidCount === 0 ? startingPrice : currentPrice + minIncrement;
      const minRequiredRounded = Number(minRequired.toFixed(2));

      if (dto.bidAmount < minRequiredRounded) {
        throw new BadRequestException(
          `Bid must be at least ${toMoneyString(minRequiredRounded)}`,
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
        message: 'Bid created successfully!',
        bid: savedBid,
      };
    });
  }

  async listBids(auctionId: string) {
    const auction = await this.auctionsRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException('This auction is no longer available');
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

    const highestBids = await Promise.all(
      [...new Set(bids.map((bid) => bid.auctionId))].map((auctionId) =>
        this.bidRepository.findOne({
          where: { auctionId },
          order: {
            bidAmount: 'DESC',
            createdAt: 'DESC',
          },
        }),
      ),
    );

    const highestBidMap = new Map(
      highestBids.filter(Boolean).map((bid) => [bid?.auctionId, bid?.bidderId]),
    );

    return bids.map((bid) => {
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
