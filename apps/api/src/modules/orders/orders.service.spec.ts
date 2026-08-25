import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderListScope } from './dto/list-orders-query.dto';
import { OrderPaymentStatus, OrderStatus } from './order.entity';
import { OrdersService } from './orders.service';

const CUSTOMER = {
  id: '00000000-0000-4000-8000-000000000003',
  email: 'customer@tastygo.com',
  role: 'user' as const,
};

const STAFF = {
  id: '00000000-0000-4000-8000-000000000002',
  email: 'hasty@tastygo.com',
  role: 'staff' as const,
};

function chain(result?: unknown) {
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result ?? [[], 0]),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
  };
  return qb;
}

describe('OrdersService', () => {
  const restaurantsService = {
    findStaffRestaurant: jest.fn(),
  };
  const orderRepo = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((row) => row),
    save: jest.fn(),
  };
  const restaurantRepo = {
    findOne: jest.fn(),
  };
  const cartRepo = {
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };
  const lineRepo = {
    create: jest.fn((row) => row),
    save: jest.fn(),
  };
  const statusRepo = {
    create: jest.fn((row) => row),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const manager = {
    getRepository: jest.fn((entity: { name?: string }) => {
      if (entity?.name === 'CartItem' || entity === cartRepo) return cartRepo;
      const name = typeof entity === 'function' ? entity.name : '';
      if (name === 'CartItem') return cartRepo;
      if (name === 'Order') return orderRepo;
      if (name === 'OrderLine') return lineRepo;
      if (name === 'DeliveryStatus') return statusRepo;
      return orderRepo;
    }),
  };
  const dataSource = {
    transaction: jest.fn(async (fn: (m: typeof manager) => Promise<unknown>) => fn(manager)),
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(async (fn) => fn(manager));
    service = new OrdersService(
      dataSource as never,
      restaurantsService as never,
      orderRepo as never,
      restaurantRepo as never,
    );
  });

  it('lists unpaid placed orders (Must visibility is not payment-gated)', async () => {
    const unpaid = {
      id: 'order-1',
      userId: CUSTOMER.id,
      restaurantId: 'rest-1',
      restaurantName: 'Hasty Tasty',
      status: OrderStatus.PLACED,
      paymentStatus: OrderPaymentStatus.PENDING,
      deliveryAddress: '21 MG Road',
      subtotal: 100,
      deliveryFee: 40,
      platformFee: 5,
      taxAmount: 7.25,
      total: 152.25,
      currency: 'INR',
      estimatedMinutes: null,
      createdAt: new Date('2026-08-01T10:00:00Z'),
      lines: [],
      deliveryStatuses: [],
    };
    const qb = chain([[unpaid], 1]);
    orderRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.list(CUSTOMER, {
      page: 1,
      limit: 20,
      scope: OrderListScope.MINE,
    });

    expect(qb.where).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.paymentStatus).toBe(OrderPaymentStatus.PENDING);
    expect(result.items[0]?.status).toBe(OrderStatus.PLACED);
  });

  it('returns an unpaid order by id', async () => {
    orderRepo.findOne.mockResolvedValue({
      id: 'order-1',
      userId: CUSTOMER.id,
      restaurantId: 'rest-1',
      restaurantName: 'Hasty Tasty',
      status: OrderStatus.PLACED,
      paymentStatus: OrderPaymentStatus.PENDING,
      deliveryAddress: '21 MG Road',
      subtotal: 100,
      deliveryFee: 40,
      platformFee: 5,
      taxAmount: 7.25,
      total: 152.25,
      currency: 'INR',
      estimatedMinutes: null,
      createdAt: new Date('2026-08-01T10:00:00Z'),
      lines: [],
      deliveryStatuses: [],
    });

    const result = await service.getById('order-1', CUSTOMER);
    expect(result.paymentStatus).toBe(OrderPaymentStatus.PENDING);
  });

  it('lets kitchen staff advance an unpaid placed order', async () => {
    const order = {
      id: 'order-1',
      userId: CUSTOMER.id,
      restaurantId: 'rest-1',
      status: OrderStatus.PLACED,
      paymentStatus: OrderPaymentStatus.PENDING,
      estimatedMinutes: null,
    };
    const lockQb = chain();
    lockQb.getOne.mockResolvedValue(order);
    orderRepo.createQueryBuilder.mockReturnValue(lockQb);
    restaurantRepo.findOne.mockResolvedValue({
      id: 'rest-1',
      ownerUserId: STAFF.id,
    });
    statusRepo.find.mockResolvedValue([{ id: 'ds-1', status: OrderStatus.PLACED }]);
    orderRepo.findOne.mockResolvedValue({
      ...order,
      restaurantName: 'Hasty Tasty',
      deliveryAddress: '21 MG Road',
      subtotal: 100,
      deliveryFee: 40,
      platformFee: 5,
      taxAmount: 7.25,
      total: 152.25,
      currency: 'INR',
      createdAt: new Date(),
      lines: [],
      deliveryStatuses: [],
      status: OrderStatus.PREPARING,
    });

    const result = await service.updateStatus('order-1', OrderStatus.PREPARING, STAFF);
    expect(result.status).toBe(OrderStatus.PREPARING);
    expect(orderRepo.save).toHaveBeenCalled();
  });

  it('rejects empty cart and missing menu relations', async () => {
    cartRepo.createQueryBuilder.mockReturnValue(chain());
    await expect(
      service.placeOrder(CUSTOMER, { deliveryAddress: '21 MG Road, Indore' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const missingMenuQb = chain();
    missingMenuQb.getMany.mockResolvedValue([{ menuItem: null }]);
    cartRepo.createQueryBuilder.mockReturnValue(missingMenuQb);
    await expect(
      service.placeOrder(CUSTOMER, { deliveryAddress: '21 MG Road, Indore' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns 404 when the order is missing', async () => {
    orderRepo.findOne.mockResolvedValue(null);
    await expect(service.getById('missing', CUSTOMER)).rejects.toBeInstanceOf(NotFoundException);
  });
});
