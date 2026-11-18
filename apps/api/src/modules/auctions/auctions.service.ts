import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auctions.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';

function toMoneyString(value: number): string {
  return value.toFixed(2);
}

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,
  ) {}

  async create(dto: CreateAuctionDto, sellerId: string): Promise<Auction> {
    const endsAt = new Date(dto.endsAt);
    if (Number.isNaN(endsAt.getTime()) || endsAt <= new Date()) {
      throw new BadRequestException('End time must be in the future');
    }

    const startingPrice = toMoneyString(dto.startingPrice);
    const description =
      dto.description == null || !dto.description.trim() ? null : dto.description.trim();
    const auction = this.auctionsRepository.create({
      title: dto.title,
      description,
      category: dto.category,
      startingPrice,
      minIncrement: toMoneyString(dto.minIncrement),
      currentPrice: startingPrice,
      endsAt,
      status: 'open',
      sellerId,
      winnerId: null,
    });

    return this.auctionsRepository.save(auction);
  }
}
