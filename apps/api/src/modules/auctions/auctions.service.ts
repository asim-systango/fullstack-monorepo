import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auctions.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionQueryDto } from './dto/get-auction-query.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { Bid } from '../bid/bid.entity';
import { JwtUser } from '../../common/auth';

function toMoneyString(value: number): string {
  return value.toFixed(2);
}

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
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
      category: dto.category.trim().toLowerCase(),
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
    // QueryBuilder does not auto-apply soft-delete filters
    qb.andWhere('auction.deletedAt IS NULL');
    if (query.q?.trim()) {
      const term = `%${query.q.trim()}%`;
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
    if (query.sellerId) {
      qb.andWhere('auction.sellerId = :sellerId', { sellerId: query.sellerId });
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

  async updateAuction(id: string, dto: UpdateAuctionDto, userId: string) {
    const auction = await this.findAuctionById(id);

    if (auction.sellerId !== userId) {
      throw new ForbiddenException('You are not authorized to update this auction');
    }

    if (auction.status !== 'open') {
      throw new BadRequestException('Only open auctions can be updated');
    }

    const bidCount = await this.bidRepository.count({
      where: { auctionId: id },
    });
    if (bidCount > 0) {
      throw new BadRequestException('This auction already has bids');
    }

    if (dto.title !== undefined) {
      auction.title = dto.title;
    }
    if (dto.description !== undefined) {
      auction.description =
        dto.description == null || !dto.description.trim()
          ? null
          : dto.description.trim();
    }
    if (dto.category !== undefined) {
      auction.category = dto.category.trim().toLowerCase();
    }
    if (dto.startingPrice !== undefined) {
      auction.startingPrice = toMoneyString(dto.startingPrice);
      auction.currentPrice = auction.startingPrice;
    }
    if (dto.minIncrement !== undefined) {
      auction.minIncrement = toMoneyString(dto.minIncrement);
    }
    if (dto.endsAt !== undefined) {
      const endsAt = new Date(dto.endsAt);
      if (Number.isNaN(endsAt.getTime()) || endsAt <= new Date()) {
        throw new BadRequestException('End time must be in the future');
      }
      auction.endsAt = endsAt;
    }
    const savedAuction = await this.auctionsRepository.save(auction);

    return {
      message: 'Auction updated successfully',
      data: savedAuction,
    };
  }

  async softDeleteAuction(id: string, user: JwtUser) {
    const auction = await this.findAuctionById(id);

    if (user.role !== 'admin' && auction.sellerId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete this auction');
    }

    await this.auctionsRepository.softDelete(id);

    return {
      message: 'Auction deleted successfully',
    };
  }

  async closeAuction(id: string, user: JwtUser) {
    const auction = await this.findAuctionById(id);

    if (user.role !== 'admin' && auction.sellerId !== user.id) {
      throw new ForbiddenException('You are not authorized to close this auction');
    }

    if (auction.status !== 'open') {
      throw new BadRequestException('This auction is already closed or cancelled.');
    }

    auction.status = 'closed';

    const bid = await this.bidRepository.findOne({
      where: {
        auctionId: auction.id,
      },
      order: {
        bidAmount: 'DESC',
        createdAt: 'DESC',
      },
    });

    auction.winnerId = bid?.bidderId ?? null;

    const savedAuction = await this.auctionsRepository.save(auction);

    return {
      message: 'Auction Closed Successfully',
      data: savedAuction,
    };
  }

  async cancelAuction(id: string) {
    const auction = await this.findAuctionById(id);

    if (auction.status !== 'open') {
      throw new BadRequestException('Only open auctions can be cancelled');
    }

    auction.status = 'cancelled';
    const savedAuction = await this.auctionsRepository.save(auction);

    return {
      message: 'Auction cancelled successfully',
      data: savedAuction,
    };
  }
}
