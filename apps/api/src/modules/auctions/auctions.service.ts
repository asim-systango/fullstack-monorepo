import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { Auction } from './auctions.entity';
import { auctionsMessages } from './auctions.messages';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionQueryDto } from './dto/get-auction-query.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { Bid } from '../bids/bids.entity';
import { Watchlist } from '../watchlist/watchlist.entity';
import { JwtUser } from '../../common/auth';
import { toMoneyString } from '../../common/money';
import { commonMessages } from '../../common/messages';

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
      title: dto.title.trim(),
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
    if (
      query.minPrice != null &&
      query.maxPrice != null &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException(auctionsMessages.INVALID_PRICE_RANGE);
    }

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

      if (auction.sellerId !== userId) {
        throw new ForbiddenException(auctionsMessages.NOT_AUTHORIZED_UPDATE);
      }

      if (auction.status !== 'open') {
        throw new BadRequestException(auctionsMessages.ONLY_OPEN_CAN_UPDATE);
      }

      const bidCount = await bidRepo.count({
        where: { auctionId: id },
      });
      if (bidCount > 0) {
        throw new BadRequestException(auctionsMessages.ALREADY_HAS_BIDS);
      }

      if (dto.title !== undefined) {
        auction.title = dto.title.trim();
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

      const savedAuction = await auctionRepo.save(auction);

      return {
        message: auctionsMessages.UPDATED_SUCCESS,
        auction: savedAuction,
      };
    });
  }

  async softDeleteAuction(id: string, user: JwtUser) {
    return this.dataSource.transaction(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);
      const watchlistRepo = manager.getRepository(Watchlist);

      const auction = await auctionRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!auction) {
        throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
      }

      if (user.role !== 'admin' && auction.sellerId !== user.id) {
        throw new ForbiddenException(auctionsMessages.NOT_AUTHORIZED_DELETE);
      }

      // Sellers must not erase sold or cancelled outcomes; admin may still clean up.
      if (user.role !== 'admin') {
        if (auction.status === 'cancelled') {
          throw new BadRequestException(auctionsMessages.CANNOT_DELETE_CANCELLED);
        }
        if (auction.status === 'closed' && auction.winnerId != null) {
          throw new BadRequestException(auctionsMessages.CANNOT_DELETE_SOLD);
        }
      }

      if (auction.status === 'open') {
        const bidCount = await bidRepo.count({ where: { auctionId: id } });
        if (bidCount > 0) {
          throw new BadRequestException(auctionsMessages.CANNOT_DELETE_OPEN_WITH_BIDS);
        }
      }

      await watchlistRepo.delete({ auctionId: id });
      await auctionRepo.softDelete(id);

      return {
        message: auctionsMessages.DELETED_SUCCESS,
      };
    });
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
    return this.dataSource.transaction(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);

      const auction = await auctionRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!auction) {
        throw new NotFoundException(commonMessages.AUCTION_NOT_FOUND);
      }

      if (auction.status !== 'open') {
        throw new BadRequestException(auctionsMessages.ONLY_OPEN_CAN_CANCEL);
      }

      // Do not void a finished sale while status is still open awaiting close/cron.
      if (auction.endsAt <= new Date()) {
        throw new BadRequestException(auctionsMessages.CANNOT_CANCEL_ENDED);
      }

      auction.status = 'cancelled';
      const savedAuction = await auctionRepo.save(auction);

      return {
        message: auctionsMessages.CANCELLED_SUCCESS,
        auction: savedAuction,
      };
    });
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

    const totalBids = await this.bidRepository
      .createQueryBuilder('bid')
      .innerJoin('bid.auction', 'auction')
      .where('auction.sellerId = :sellerId', { sellerId })
      .andWhere('auction.deletedAt IS NULL')
      .getCount();

    return {
      openAuctions,
      totalBids,
      itemsSold,
    };
  }
}
