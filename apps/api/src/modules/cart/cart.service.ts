import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../restaurants/menu-item.entity';
import { CartItem } from './cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';

export type CartLineDto = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export type CartSummaryDto = {
  items: CartLineDto[];
  restaurantId: string | null;
  restaurantName: string | null;
};

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
  ) {}

  async getCart(userId: string): Promise<CartSummaryDto> {
    const items = await this.cartRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.menuItem', 'menuItem')
      .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
      .where('c.userId = :userId', { userId })
      .withDeleted()
      .orderBy('c.createdAt', 'ASC')
      .getMany();

    const lines: CartLineDto[] = [];

    for (const item of items) {
      if (!item.menuItem || item.menuItem.deletedAt) {
        continue;
      }

      lines.push({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        restaurantId: item.menuItem.restaurantId,
        restaurantName: item.menuItem.restaurant.name,
      });
    }

    const first = lines[0];
    return {
      items: lines,
      restaurantId: first?.restaurantId ?? null,
      restaurantName: first?.restaurantName ?? null,
    };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartSummaryDto> {
    const quantity = dto.quantity ?? 1;

    const menuItem = await this.menuItemRepo.findOne({
      where: { id: dto.menuItemId },
      relations: { restaurant: true },
    });

    if (!menuItem || menuItem.deletedAt) {
      throw new NotFoundException('Menu item not available');
    }

    const currentCart = await this.cartRepo.find({
      where: { userId },
      relations: { menuItem: true },
    });

    // One restaurant per cart — required by the project brief.
    const existingRestaurantId = currentCart[0]?.menuItem.restaurantId;
    if (existingRestaurantId && existingRestaurantId !== menuItem.restaurantId) {
      throw new BadRequestException(
        'Cart already has items from another restaurant',
      );
    }

    const existingLine = currentCart.find(
      (line) => line.menuItemId === dto.menuItemId,
    );

    if (existingLine) {
      existingLine.quantity += quantity;
      await this.cartRepo.save(existingLine);
    } else {
      const line = this.cartRepo.create({
        userId,
        menuItemId: menuItem.id,
        quantity,
      });
      await this.cartRepo.save(line);
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartSummaryDto> {
    const line = await this.cartRepo.findOne({
      where: { id: cartItemId, userId },
    });

    if (!line) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartRepo.remove(line);
    } else {
      line.quantity = quantity;
      await this.cartRepo.save(line);
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartSummaryDto> {
    await this.cartRepo.delete({ userId });
    return this.getCart(userId);
  }

  /** Used by OrdersService inside a DB transaction. */
  async getCartEntities(userId: string) {
    return this.cartRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.menuItem', 'menuItem')
      .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
      .where('c.userId = :userId', { userId })
      .withDeleted()
      .getMany();
  }
}
