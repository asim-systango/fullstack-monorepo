import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { ListMenuItemsQueryDto } from './dto/list-menu-items-query.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItem } from './menu-item.entity';
import { RestaurantsService } from './restaurants.service';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async list(query: ListMenuItemsQueryDto, user?: JwtUser | null) {
    const includeDeleted = query.includeDeleted === true;

    if (includeDeleted) {
      if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
        throw new ForbiddenException('Only staff can view deleted menu items');
      }
      if (user.role === 'staff') {
        const mine = await this.restaurantsService.findStaffRestaurant(user.id);
        if (!mine || mine.id !== query.restaurantId) {
          throw new ForbiddenException('You can only manage your own restaurant menu');
        }
      }
    }

    const items = await this.menuItemRepo.find({
      where: { restaurantId: query.restaurantId },
      withDeleted: includeDeleted,
      order: { name: 'ASC' },
    });

    return items;
  }

  async getById(id: string) {
    const item = await this.menuItemRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!item || item.deletedAt) {
      throw new NotFoundException('Menu item not available');
    }
    return item;
  }

  async create(dto: CreateMenuItemDto, user: JwtUser) {
    const restaurant = await this.restaurantsService.getById(dto.restaurantId);
    this.restaurantsService.assertCanManage(restaurant, user);

    const item = this.menuItemRepo.create({
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      price: dto.price,
    });

    return this.menuItemRepo.save(item);
  }

  async update(id: string, dto: UpdateMenuItemDto, user: JwtUser) {
    const item = await this.menuItemRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    const restaurant = await this.restaurantsService.getById(item.restaurantId);
    this.restaurantsService.assertCanManage(restaurant, user);

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl;
    if (dto.price !== undefined) item.price = dto.price;

    return this.menuItemRepo.save(item);
  }

  async softDelete(id: string, user: JwtUser) {
    const item = await this.menuItemRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    const restaurant = await this.restaurantsService.getById(item.restaurantId);
    this.restaurantsService.assertCanManage(restaurant, user);

    await this.menuItemRepo.softDelete(id);
  }
}
