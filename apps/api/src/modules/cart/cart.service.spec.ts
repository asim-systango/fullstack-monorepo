import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { CartService } from './cart.service';

const USER_ID = '00000000-0000-4000-8000-000000000003';
const MENU_A = {
  id: 'menu-a',
  restaurantId: 'rest-a',
  deletedAt: null,
  restaurant: { name: 'Hasty Tasty' },
};
const MENU_B = {
  id: 'menu-b',
  restaurantId: 'rest-b',
  deletedAt: null,
  restaurant: { name: 'Burger Barn' },
};

function mockQueryBuilder(rows: unknown[]) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  };
}

describe('CartService', () => {
  const cartRepo = {
    createQueryBuilder: jest.fn(),
    create: jest.fn((row) => row),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };
  const menuItemRepo = {
    findOne: jest.fn(),
  };
  const manager = {
    getRepository: jest.fn(() => cartRepo),
  };
  const dataSource = {
    transaction: jest.fn(async (fn: (m: typeof manager) => Promise<unknown>) => fn(manager)),
  };

  let service: CartService;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(async (fn) => fn(manager));
    manager.getRepository.mockReturnValue(cartRepo);
    service = new CartService(dataSource as never, cartRepo as never, menuItemRepo as never);
  });

  it('rejects a second restaurant without reading a missing menuItem', async () => {
    menuItemRepo.findOne.mockResolvedValue(MENU_B);
    cartRepo.createQueryBuilder.mockReturnValue(
      mockQueryBuilder([
        { menuItemId: 'orphaned', menuItem: null },
        { menuItemId: MENU_A.id, menuItem: MENU_A, quantity: 1 },
      ]),
    );

    await expect(service.addItem(USER_ID, { menuItemId: MENU_B.id, quantity: 1 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('maps unique-constraint races to 409', async () => {
    menuItemRepo.findOne.mockResolvedValue(MENU_A);
    cartRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder([]));
    cartRepo.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], Object.assign(new Error('duplicate key'), { code: '23505' })),
    );

    await expect(service.addItem(USER_ID, { menuItemId: MENU_A.id, quantity: 1 })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns 404 when the menu item is gone', async () => {
    menuItemRepo.findOne.mockResolvedValue({ ...MENU_A, deletedAt: new Date() });

    await expect(service.addItem(USER_ID, { menuItemId: MENU_A.id })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('skips deleted lines and does not crash when restaurant is missing', async () => {
    cartRepo.createQueryBuilder.mockReturnValue(
      mockQueryBuilder([
        { id: '1', menuItemId: 'gone', menuItem: { deletedAt: new Date(), restaurantId: 'x' } },
        {
          id: '2',
          menuItemId: MENU_A.id,
          quantity: 2,
          menuItem: {
            id: MENU_A.id,
            name: 'Butter Chicken',
            price: 225,
            restaurantId: MENU_A.restaurantId,
          },
        },
      ]),
    );

    await expect(service.getCart(USER_ID)).resolves.toEqual({
      items: [
        {
          id: '2',
          menuItemId: MENU_A.id,
          name: 'Butter Chicken',
          price: 225,
          quantity: 2,
          restaurantId: MENU_A.restaurantId,
          restaurantName: 'Restaurant',
        },
      ],
      restaurantId: MENU_A.restaurantId,
      restaurantName: 'Restaurant',
    });
  });
});
