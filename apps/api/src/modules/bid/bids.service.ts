import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { Bid } from './bid.entity';
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
  ) {}

  async placeBid(auctionId: string, bidderId: string, dto: CreateBidDto) {
    return this.dataSource.transaction(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);

      const auction = await auctionRepo.findOne({ where: { id: auctionId } });
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
        Bid: savedBid,
      };
    });
  }
}
