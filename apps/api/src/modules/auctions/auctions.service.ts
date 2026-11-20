import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { Auction } from './auctions.entity';
import { auctionsMessages } from './auctions.messages';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionQueryDto } from './dto/get-auction-query.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { Bid } from '../bids/bids.entity';
import { JwtUser } from '../../common/auth';
import { commonMessages } from '../../common/messages';

function toMoneyString(value: number): string {
  return value.toFixed(2);
}

@Injectable()
export class AuctionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  async create(dto: CreateAuctionDto, sellerId: string): Promise<Auction> {
    const endsAt = new Date(dto.endsAt);
    if (Number.isNaN(endsAt.getTime()) || endsAt <= new Date()) {
      throw new BadRequestException(auctionsMessages.END_TIME_MUST_BE_FUTURE);
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
      throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
    }
    return auction;
  }

  async updateAuction(id: string, dto: UpdateAuctionDto, userId: string) {
    const auction = await this.findAuctionById(id);

    if (auction.sellerId !== userId) {
      throw new ForbiddenException(auctionsMessages.NOT_AUTHORIZED_UPDATE);
    }

    if (auction.status !== 'open') {
      throw new BadRequestException(auctionsMessages.ONLY_OPEN_CAN_UPDATE);
    }

    const bidCount = await this.bidRepository.count({
      where: { auctionId: id },
    });
    if (bidCount > 0) {
      throw new BadRequestException(auctionsMessages.ALREADY_HAS_BIDS);
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
        throw new BadRequestException(auctionsMessages.END_TIME_MUST_BE_FUTURE);
      }
      auction.endsAt = endsAt;
    }
    const savedAuction = await this.auctionsRepository.save(auction);

    return {
      message: auctionsMessages.UPDATED_SUCCESS,
      auction: savedAuction,
    };
  }

  async softDeleteAuction(id: string, user: JwtUser) {
    const auction = await this.findAuctionById(id);

    if (user.role !== 'admin' && auction.sellerId !== user.id) {
      throw new ForbiddenException(auctionsMessages.NOT_AUTHORIZED_DELETE);
    }

    await this.auctionsRepository.softDelete(id);

    return {
      message: auctionsMessages.DELETED_SUCCESS,
    };
  }
  async finalizeAsClosed(
    auction: Auction,
    auctionRepo: Repository<Auction>,
    bidRepo: Repository<Bid>,
  ): Promise<Auction> {
    const winningBid = await bidRepo.findOne({
      where: { auctionId: auction.id },
      order: {
        bidAmount: 'DESC',
        createdAt: 'ASC',
      },
    });

    auction.status = 'closed';
    auction.winnerId = winningBid?.bidderId ?? null;
    return auctionRepo.save(auction);
  }

  async closeAuction(id: string, user: JwtUser) {
    return this.dataSource.transaction(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);

      const auction = await auctionRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!auction) {
        throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
      }

      if (user.role !== 'admin' && auction.sellerId !== user.id) {
        throw new ForbiddenException(auctionsMessages.NOT_AUTHORIZED_CLOSE);
      }

      if (auction.status !== 'open') {
        throw new BadRequestException(auctionsMessages.ALREADY_CLOSED_OR_CANCELLED);
      }

      const savedAuction = await this.finalizeAsClosed(auction, auctionRepo, bidRepo);

      return {
        message: auctionsMessages.CLOSED_SUCCESS,
        auction: savedAuction,
      };
    });
  }

  async cancelAuction(id: string) {
    const auction = await this.findAuctionById(id);

    if (auction.status !== 'open') {
      throw new BadRequestException(auctionsMessages.ONLY_OPEN_CAN_CANCEL);
    }

    auction.status = 'cancelled';
    const savedAuction = await this.auctionsRepository.save(auction);

    return {
      message: auctionsMessages.CANCELLED_SUCCESS,
      auction: savedAuction,
    };
  }

  async getAuctionDashboard(sellerId: string) {
    const openAuctions = await this.auctionsRepository.count({
      where: {
        sellerId,
        status: 'open',
      },
    });

    const itemsSold = await this.auctionsRepository.count({
      where: {
        sellerId,
        status: 'closed',
        winnerId: Not(IsNull()),
      },
    });

    const sellerAuctions = await this.auctionsRepository.find({
      where: { sellerId },
      select: { id: true },
    });
    const auctionIds = sellerAuctions.map((auction) => auction.id);
    const totalBids =
      auctionIds.length === 0
        ? 0
        : await this.bidRepository.count({
            where: { auctionId: In(auctionIds) },
          });

    return {
      openAuctions,
      totalBids,
      itemsSold,
    };
  }
}
