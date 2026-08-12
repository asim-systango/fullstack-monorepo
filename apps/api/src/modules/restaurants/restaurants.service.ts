import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getSkip, paginate } from '../../common/pagination';
import type { JwtUser } from '../../common/auth';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { ListRestaurantsQueryDto } from './dto/list-restaurants-query.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async list(query: ListRestaurantsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = getSkip(page, limit);

    const qb = this.restaurantRepo.createQueryBuilder('r');

    if (query.cuisine) {
      qb.andWhere('r.cuisine ILIKE :cuisine', {
        cuisine: `%${query.cuisine}%`,
      });
    }

    if (query.q) {
      qb.andWhere(
        '(r.name ILIKE :q OR r.cuisine ILIKE :q OR r.address ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }

    qb.orderBy('r.name', 'ASC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, page, limit);
  }

  async getById(id: string) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async create(dto: CreateRestaurantDto) {
    const existing = await this.restaurantRepo.findOne({
      where: { ownerUserId: dto.ownerUserId },
    });
    if (existing) {
      throw new ConflictException('This staff user already owns a restaurant');
    }

    const restaurant = this.restaurantRepo.create({
      name: dto.name,
      cuisine: dto.cuisine,
      address: dto.address,
      description: dto.description ?? null,
      emoji: dto.emoji ?? null,
      eta: dto.eta ?? null,
      ownerUserId: dto.ownerUserId,
      rating: 0,
    });

    return this.restaurantRepo.save(restaurant);
  }

  async update(id: string, dto: UpdateRestaurantDto, user: JwtUser) {
    const restaurant = await this.getById(id);
    this.assertCanManage(restaurant, user);

    if (dto.name !== undefined) restaurant.name = dto.name;
    if (dto.cuisine !== undefined) restaurant.cuisine = dto.cuisine;
    if (dto.address !== undefined) restaurant.address = dto.address;
    if (dto.description !== undefined) restaurant.description = dto.description;
    if (dto.emoji !== undefined) restaurant.emoji = dto.emoji;
    if (dto.eta !== undefined) restaurant.eta = dto.eta;

    return this.restaurantRepo.save(restaurant);
  }

  /** Staff may only manage their own restaurant. Admin can manage any. */
  assertCanManage(restaurant: Restaurant, user: JwtUser) {
    if (user.role === 'admin') return;
    if (user.role === 'staff' && restaurant.ownerUserId === user.id) return;
    throw new ForbiddenException('You cannot manage this restaurant');
  }

  /** Each staff account owns exactly one kitchen. */
  async findStaffRestaurant(userId: string): Promise<Restaurant | null> {
    return this.restaurantRepo.findOne({
      where: { ownerUserId: userId },
      order: { rating: 'DESC', createdAt: 'ASC' },
    });
  }

  /** Staff: their single restaurant. Admin: null (use list/create instead). */
  async getMine(user: JwtUser): Promise<Restaurant | null> {
    if (user.role !== 'staff') {
      return null;
    }
    return this.findStaffRestaurant(user.id);
  }
}
