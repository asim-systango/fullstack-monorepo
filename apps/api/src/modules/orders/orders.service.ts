import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { getSkip, paginate } from '../../common/pagination';
import { calculatePricing } from '../../common/pricing';
import { CartItem } from '../cart/cart-item.entity';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { Restaurant } from '../restaurants/restaurant.entity';
import { DeliveryStatus } from './delivery-status.entity';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { OrderLine } from './order-line.entity';
import {
  Order,
  OrderPaymentStatus,
  OrderStatus,
} from './order.entity';
import { canMoveStatus } from './order-status';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly restaurantsService: RestaurantsService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  /** Shape that matches the frontend Order type. */
  private toResponse(order: Order) {
    return {
      id: order.id,
      userId: order.userId,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      platformFee: order.platformFee,
      taxAmount: order.taxAmount,
      total: order.total,
      currency: order.currency,
      estimatedMinutes: order.estimatedMinutes,
      createdAt: order.createdAt.toISOString(),
      lines: (order.lines ?? []).map((line) => ({
        id: line.id,
        menuItemId: line.menuItemId,
        itemName: line.itemName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      deliveryStatuses: (order.deliveryStatuses ?? []).map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async list(user: JwtUser, query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = getSkip(page, limit);
    const scope = query.scope ?? 'mine';

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.lines', 'lines')
      .leftJoinAndSelect('o.deliveryStatuses', 'deliveryStatuses')
      // Only show orders after successful payment (hide pending / failed).
      .where('o.payment_status = :paid', { paid: OrderPaymentStatus.PAID })
      .orderBy('o.createdAt', 'DESC')
      .addOrderBy('deliveryStatuses.createdAt', 'ASC')
      .skip(skip)
      .take(limit);

    if (scope === 'mine') {
      // Orders this account placed as a customer (all roles).
      qb.andWhere('o.user_id = :userId', { userId: user.id });
    } else if (scope === 'restaurant') {
      if (user.role !== 'staff' && user.role !== 'admin') {
        throw new ForbiddenException('Only restaurant staff can view incoming orders');
      }
      if (user.role === 'staff') {
        const mine = await this.restaurantsService.findStaffRestaurant(user.id);
        if (!mine) {
          return paginate([], 0, page, limit);
        }
        qb.andWhere('o.restaurant_id = :restaurantId', { restaurantId: mine.id });
      }
      // admin + restaurant scope → all restaurants
    } else if (scope === 'all') {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Only admin can list all orders');
      }
    }

    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }

    const [items, total] = await qb.getManyAndCount();
    return paginate(
      items.map((order) => this.toResponse(order)),
      total,
      page,
      limit,
    );
  }

  async getById(id: string, user: JwtUser) {
    return this.loadOrderForUser(id, user, { requirePaid: true });
  }

  private async loadOrderForUser(
    id: string,
    user: JwtUser,
    options: { requirePaid: boolean },
  ) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { lines: true, deliveryStatuses: true },
      order: { deliveryStatuses: { createdAt: 'ASC' } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (options.requirePaid && order.paymentStatus !== OrderPaymentStatus.PAID) {
      throw new NotFoundException('Order not found');
    }

    await this.assertCanView(order, user);
    return this.toResponse(order);
  }

  async placeOrder(user: JwtUser, dto: PlaceOrderDto) {
    const orderId = await this.dataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(CartItem);
      const orderRepo = manager.getRepository(Order);
      const lineRepo = manager.getRepository(OrderLine);
      const statusRepo = manager.getRepository(DeliveryStatus);

      const cartItems = await cartRepo
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.menuItem', 'menuItem')
        .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
        .where('c.userId = :userId', { userId: user.id })
        .withDeleted()
        .getMany();

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Make sure every menu item is still available.
      for (const cartItem of cartItems) {
        if (!cartItem.menuItem || cartItem.menuItem.deletedAt) {
          throw new BadRequestException(
            'One or more cart items are no longer available',
          );
        }
      }

      const first = cartItems[0]!;
      const restaurantId = first.menuItem.restaurantId;
      const restaurantName = first.menuItem.restaurant.name;

      const mixed = cartItems.some(
        (item) => item.menuItem.restaurantId !== restaurantId,
      );
      if (mixed) {
        throw new BadRequestException(
          'Cart already has items from another restaurant',
        );
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0,
      );
      const pricing = calculatePricing(subtotal);

      const order = orderRepo.create({
        userId: user.id,
        restaurantId,
        restaurantName,
        status: OrderStatus.PLACED,
        deliveryAddress: dto.deliveryAddress,
        paymentStatus: OrderPaymentStatus.PENDING,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        platformFee: pricing.platformFee,
        taxAmount: pricing.taxAmount,
        total: pricing.total,
        currency: pricing.currency,
        estimatedMinutes: null,
      });
      const savedOrder = await orderRepo.save(order);

      const lines = cartItems.map((item) =>
        lineRepo.create({
          orderId: savedOrder.id,
          menuItemId: item.menuItemId,
          itemName: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.menuItem.price,
        }),
      );
      await lineRepo.save(lines);

      await statusRepo.save(
        statusRepo.create({
          orderId: savedOrder.id,
          status: OrderStatus.PLACED,
        }),
      );

      await cartRepo.delete({ userId: user.id });

      return savedOrder.id;
    });

    return this.loadOrderForUser(orderId, user, { requirePaid: false });
  }

  async updateStatus(orderId: string, nextStatus: OrderStatus, user: JwtUser) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { lines: true, deliveryStatuses: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.assertCanManageKitchen(order, user);

    if (order.paymentStatus !== OrderPaymentStatus.PAID) {
      throw new BadRequestException('Order is not paid yet');
    }

    if (!canMoveStatus(order.status, nextStatus)) {
      throw new BadRequestException(
        `Cannot move from ${order.status} to ${nextStatus}`,
      );
    }

    order.status = nextStatus;
    if (nextStatus === OrderStatus.PREPARING && !order.estimatedMinutes) {
      order.estimatedMinutes = 30;
    }

    await this.orderRepo.save(order);

    await this.dataSource.getRepository(DeliveryStatus).save({
      orderId: order.id,
      status: nextStatus,
    });

    return this.getById(order.id, user);
  }

  private async assertCanView(order: Order, user: JwtUser) {
    if (order.userId === user.id) return;
    if (user.role === 'admin') return;

    if (user.role === 'staff') {
      const restaurant = await this.restaurantRepo.findOne({
        where: { id: order.restaurantId },
      });
      if (restaurant && restaurant.ownerUserId === user.id) return;
    }

    throw new ForbiddenException('You cannot view this order');
  }

  private async assertCanManageKitchen(order: Order, user: JwtUser) {
    if (user.role === 'admin') return;

    if (user.role === 'staff') {
      const restaurant = await this.restaurantRepo.findOne({
        where: { id: order.restaurantId },
      });
      if (restaurant && restaurant.ownerUserId === user.id) return;
    }

    throw new ForbiddenException('Only restaurant staff can update status');
  }
}
