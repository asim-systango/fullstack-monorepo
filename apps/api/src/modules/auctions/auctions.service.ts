import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auctions.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionQueryDto } from './dto/get-auction-query.dto';

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

  async findAll(query: GetAuctionQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const qb = this.auctionsRepository.createQueryBuilder('auction');
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(auction.title ILIKE :search OR auction.description ILIKE :search)', {
        search: term,
      });
    }
    if (query.category?.trim()) {
      qb.andWhere('auction.category = :category', {
        category: query.category.trim()?.toLowerCase(),
      });
    }
    if (query.status) {
      qb.andWhere('auction.status = :status', { status: query.status });
    }
    if (query.minPrice != null) {
      qb.andWhere('auction.currentPrice >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice != null) {
      qb.andWhere('auction.currentPrice <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    qb.orderBy('auction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findAuctionById(id: string) {
    const auction = await this.auctionsRepository.findOne({ where: { id } });
    if (!auction) {
      throw new NotFoundException('This auction is no longer available');
    }
    return auction;
  }
}
