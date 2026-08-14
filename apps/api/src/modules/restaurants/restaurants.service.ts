import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getSkip, paginate } from '../../common/pagination';
import type { JwtUser } from '../../common/auth';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { ListRestaurantsQueryDto } from './dto/list-restaurants-query.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant, RestaurantDietType } from './restaurant.entity';
import { StaffOwnerProvisioner } from './staff-owner.provisioner';

export type StaffLoginDetails = {
  email: string;
  password: string;
  role: 'staff';
};

export type CreateRestaurantResult = {
  restaurant: Restaurant;
  staffLogin: StaffLoginDetails | null;
};

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly staffOwnerProvisioner: StaffOwnerProvisioner,
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

  async create(dto: CreateRestaurantDto): Promise<CreateRestaurantResult> {
    if (dto.ownerUserId) {
      const restaurant = await this.createWithExistingOwner(dto);
      return { restaurant, staffLogin: null };
    }

    if (!dto.ownerEmail?.trim()) {
      throw new BadRequestException('Restaurant email is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const staff = await this.staffOwnerProvisioner.createForRestaurant(
        dto.name,
        dto.ownerEmail,
        queryRunner,
      );

      const existingRestaurant = await queryRunner.manager.findOne(Restaurant, {
        where: { ownerUserId: staff.id },
      });
      if (existingRestaurant) {
        throw new ConflictException('This staff user already owns a restaurant');
      }

      const restaurant = queryRunner.manager.create(Restaurant, {
        name: dto.name,
        cuisine: dto.cuisine,
        address: dto.address,
        description: dto.description ?? null,
        emoji: dto.emoji ?? null,
        imageUrl: dto.imageUrl ?? null,
        eta: dto.eta ?? null,
        dietType: dto.dietType ?? RestaurantDietType.BOTH,
        ownerUserId: staff.id,
        rating: dto.rating ?? 0,
      });

      const saved = await queryRunner.manager.save(restaurant);
      await queryRunner.commitTransaction();

      return {
        restaurant: saved,
        staffLogin: {
          email: staff.email,
          password: staff.plainPassword,
          role: 'staff',
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async createWithExistingOwner(dto: CreateRestaurantDto) {
    const ownerUserId = dto.ownerUserId!;

    const existing = await this.restaurantRepo.findOne({
      where: { ownerUserId },
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
      imageUrl: dto.imageUrl ?? null,
      eta: dto.eta ?? null,
      dietType: dto.dietType ?? RestaurantDietType.BOTH,
      ownerUserId,
      rating: dto.rating ?? 0,
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
    if (dto.imageUrl !== undefined) restaurant.imageUrl = dto.imageUrl;
    if (dto.eta !== undefined) restaurant.eta = dto.eta;
    if (dto.rating !== undefined) restaurant.rating = dto.rating;
    if (dto.dietType !== undefined) restaurant.dietType = dto.dietType;

    return this.restaurantRepo.save(restaurant);
  }

  assertCanManage(restaurant: Restaurant, user: JwtUser) {
    if (user.role === 'admin') return;
    if (user.role === 'staff' && restaurant.ownerUserId === user.id) return;
    throw new ForbiddenException('You cannot manage this restaurant');
  }

  async findStaffRestaurant(userId: string): Promise<Restaurant | null> {
    return this.restaurantRepo.findOne({
      where: { ownerUserId: userId },
      order: { rating: 'DESC', createdAt: 'ASC' },
    });
  }

  async getMine(user: JwtUser): Promise<Restaurant | null> {
    if (user.role !== 'staff') {
      return null;
    }
    return this.findStaffRestaurant(user.id);
  }
}
