import '../load-env';
import 'reflect-metadata';
import { calculatePricing } from '../common/pricing';
import dataSource from './data-source';
import { CartItem } from '../modules/cart/cart-item.entity';
import { MenuItem } from '../modules/restaurants/menu-item.entity';
import { Restaurant, RestaurantDietType } from '../modules/restaurants/restaurant.entity';
import { DeliveryStatus } from '../modules/orders/delivery-status.entity';
import { OrderLine } from '../modules/orders/order-line.entity';
import {
  Order,
  OrderPaymentStatus,
  OrderStatus,
} from '../modules/orders/order.entity';

const CUSTOMER_EMAIL = 'customer@tastygo.com';
const CUSTOMER_ADDRESS = '21 MG Road, Apt 4B, Indore';

const MENU_IDS = {
  butterChicken: 'a1111111-1111-4111-8111-111111111111',
  garlicNaan: 'a1111111-1111-4111-8111-111111111112',
  paneerTikka: 'a1111111-1111-4111-8111-111111111113',
  dalMakhani: 'a1111111-1111-4111-8111-111111111114',
  jeeraRice: 'a1111111-1111-4111-8111-111111111115',
  gulabJamun: 'a1111111-1111-4111-8111-111111111116',
  cheeseburger: 'a2222222-2222-4222-8222-222222222221',
  fries: 'a2222222-2222-4222-8222-222222222222',
  chickenWrap: 'a2222222-2222-4222-8222-222222222223',
  chefPlatter: 'a3333333-3333-4333-8333-333333333331',
  salmonRoll: 'a3333333-3333-4333-8333-333333333332',
  misoSoup: 'a3333333-3333-4333-8333-333333333333',
  penne: 'a4444444-4444-4444-8444-444444444441',
  garlicBread: 'a4444444-4444-4444-8444-444444444442',
  tiramisu: 'a4444444-4444-4444-8444-444444444443',
  paniPuri: 'a5555555-5555-4555-8555-555555555551',
  vegThali: 'a5555555-5555-4555-8555-555555555552',
  masalaChai: 'a5555555-5555-4555-8555-555555555553',
} as const;

const ORDER_IDS = {
  placed: '01111111-1111-4111-8111-111111111111',
  preparing: '02222222-2222-4222-8222-222222222222',
  delivered: '03333333-3333-4333-8333-333333333333',
} as const;

const RESTAURANT_SEEDS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    ownerEmail: 'hasty@tastygo.com',
    name: 'Hasty Tasty',
    cuisine: 'Indian',
    address: '142 Rajwada Road, Indore',
    description: 'Homestyle curries and fresh naan.',
    emoji: '🍛',
    imageUrl: '/seed/restaurants/hasty-tasty.jpg',
    rating: 4.6,
    eta: '25-35 min',
    dietType: RestaurantDietType.BOTH,
    menu: [
      {
        id: MENU_IDS.butterChicken,
        name: 'Butter Chicken',
        description: 'Creamy tomato curry, served with rice',
        price: 225,
      },
      {
        id: MENU_IDS.garlicNaan,
        name: 'Garlic Naan',
        description: 'Tandoor-baked flatbread',
        price: 60,
      },
      {
        id: MENU_IDS.paneerTikka,
        name: 'Paneer Tikka',
        description: 'Char-grilled cottage cheese skewers',
        price: 210,
      },
      {
        id: MENU_IDS.dalMakhani,
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils',
        price: 180,
        imageUrl: '/seed/menu/dal-makhani.jpg',
      },
      {
        id: MENU_IDS.jeeraRice,
        name: 'Jeera Rice',
        description: 'Cumin-tempered basmati',
        price: 90,
      },
      {
        id: MENU_IDS.gulabJamun,
        name: 'Gulab Jamun',
        description: 'Warm milk dumplings in syrup',
        price: 80,
      },
    ],
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    ownerEmail: 'burger@tastygo.com',
    name: 'Burger Barn',
    cuisine: 'American',
    address: '88 FC Road, Indore',
    description: 'Smash burgers and crispy fries.',
    emoji: '🍔',
    imageUrl: '/seed/restaurants/burger-barn.jpg',
    rating: 4.3,
    eta: '20-30 min',
    dietType: RestaurantDietType.NON_VEG,
    menu: [
      {
        id: MENU_IDS.cheeseburger,
        name: 'Classic Cheeseburger',
        description: 'Double patty, cheddar',
        price: 175,
      },
      {
        id: MENU_IDS.fries,
        name: 'Crispy Fries',
        description: 'Salted shoestring fries',
        price: 120,
      },
      {
        id: MENU_IDS.chickenWrap,
        name: 'Chicken Wrap',
        description: 'Grilled chicken wrap',
        price: 160,
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    ownerEmail: 'sushi@tastygo.com',
    name: 'Sushi Sagara',
    cuisine: 'Japanese',
    address: '12 Sakura Lane, Indore',
    description: 'Fresh rolls and chef platters.',
    emoji: '🍣',
    rating: 4.8,
    eta: '30-40 min',
    dietType: RestaurantDietType.NON_VEG,
    menu: [
      {
        id: MENU_IDS.chefPlatter,
        name: "Chef's Platter",
        description: 'Assorted nigiri and rolls',
        price: 890,
        imageUrl: '/seed/menu/chefs-platter.jpg',
      },
      {
        id: MENU_IDS.salmonRoll,
        name: 'Salmon Roll',
        description: 'Fresh salmon maki',
        price: 320,
      },
      {
        id: MENU_IDS.misoSoup,
        name: 'Miso Soup',
        description: 'Traditional soybean soup',
        price: 90,
      },
    ],
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    ownerEmail: 'pasta@tastygo.com',
    name: 'Pasta Piazza',
    cuisine: 'Italian',
    address: '5 Roma Street, Indore',
    description: 'Handmade pasta and wood-fired sauces.',
    emoji: '🍝',
    imageUrl: '/seed/restaurants/pasta-piazza.jpg',
    rating: 4.4,
    eta: '25-35 min',
    dietType: RestaurantDietType.BOTH,
    menu: [
      {
        id: MENU_IDS.penne,
        name: 'Penne Arrabbiata',
        description: 'Spicy tomato pasta',
        price: 240,
      },
      {
        id: MENU_IDS.garlicBread,
        name: 'Garlic Bread',
        description: 'Toasted with herbs',
        price: 80,
      },
      {
        id: MENU_IDS.tiramisu,
        name: 'Tiramisu',
        description: 'Classic Italian dessert',
        price: 180,
        imageUrl: '/seed/menu/tiramisu.jpg',
      },
    ],
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    ownerEmail: 'spice@tastygo.com',
    name: 'Spice Route',
    cuisine: 'Indian',
    address: '9 Sarafa Bazaar, Indore',
    description: 'Street-style chaat and thalis.',
    emoji: '🌶️',
    imageUrl: '/seed/restaurants/spice-route.jpg',
    rating: 4.5,
    eta: '20-30 min',
    dietType: RestaurantDietType.VEG,
    menu: [
      {
        id: MENU_IDS.paniPuri,
        name: 'Pani Puri',
        description: 'Crispy puris with spicy water',
        price: 70,
      },
      {
        id: MENU_IDS.vegThali,
        name: 'Veg Thali',
        description: 'Full plate with roti and rice',
        price: 199,
        imageUrl: '/seed/menu/veg-thali.jpg',
      },
      {
        id: MENU_IDS.masalaChai,
        name: 'Masala Chai',
        description: 'Spiced milk tea',
        price: 40,
        imageUrl: '/seed/menu/masala-chai.jpg',
      },
    ],
  },
] as const;

type SeedUserRow = { id: string };

async function findUserId(email: string): Promise<string> {
  const rows: SeedUserRow[] = await dataSource.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  const owner = rows[0];
  if (!owner) {
    throw new Error(
      `User ${email} not found. Run gateway seed first: pnpm seed  (or pnpm seed:all)`,
    );
  }
  return owner.id;
}

function applySeedImage(
  current: string | null | undefined,
  next: string | undefined,
): string | null | undefined {
  if (!next) return current;
  if (!current || current.startsWith('/seed/')) return next;
  return current;
}

async function seedRestaurantsAndMenus() {
  const restaurantRepo = dataSource.getRepository(Restaurant);
  const menuRepo = dataSource.getRepository(MenuItem);
  let menuCount = 0;

  for (const row of RESTAURANT_SEEDS) {
    const ownerUserId = await findUserId(row.ownerEmail);
    let restaurant = await restaurantRepo.findOne({ where: { id: row.id } });
    const imageUrl = applySeedImage(
      restaurant?.imageUrl,
      'imageUrl' in row ? row.imageUrl : undefined,
    );

    if (!restaurant) {
      restaurant = restaurantRepo.create({
        id: row.id,
        ownerUserId,
        name: row.name,
        cuisine: row.cuisine,
        address: row.address,
        description: row.description,
        emoji: row.emoji,
        imageUrl: imageUrl ?? null,
        rating: row.rating,
        eta: row.eta,
        dietType: row.dietType,
      });
    } else {
      restaurant.ownerUserId = ownerUserId;
      restaurant.name = row.name;
      restaurant.cuisine = row.cuisine;
      restaurant.address = row.address;
      restaurant.description = row.description;
      restaurant.emoji = row.emoji;
      restaurant.imageUrl = imageUrl ?? restaurant.imageUrl;
      restaurant.rating = row.rating;
      restaurant.eta = row.eta;
      restaurant.dietType = row.dietType;
    }

    await restaurantRepo.save(restaurant);

    for (const item of row.menu) {
      const existing =
        (await menuRepo.findOne({
          where: { id: item.id },
          withDeleted: true,
        })) ??
        (await menuRepo.findOne({
          where: { restaurantId: restaurant.id, name: item.name },
          withDeleted: true,
        }));

      const nextImage = applySeedImage(
        existing?.imageUrl,
        'imageUrl' in item ? item.imageUrl : undefined,
      );

      if (existing) {
        existing.restaurantId = restaurant.id;
        existing.name = item.name;
        existing.description = item.description;
        existing.price = item.price;
        existing.imageUrl = nextImage ?? existing.imageUrl ?? null;
        if (existing.deletedAt) {
          await menuRepo.recover(existing);
        } else {
          await menuRepo.save(existing);
        }
      } else {
        await menuRepo.save(
          menuRepo.create({
            id: item.id,
            restaurantId: restaurant.id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: nextImage ?? null,
          }),
        );
      }
      menuCount += 1;
    }

    console.log(`  restaurant  ${row.name}  ←  ${row.ownerEmail}`);
  }

  return { restaurantCount: RESTAURANT_SEEDS.length, menuCount };
}

async function findMenuItemId(restaurantId: string, name: string): Promise<string> {
  const menuRepo = dataSource.getRepository(MenuItem);
  const item = await menuRepo.findOne({
    where: { restaurantId, name },
    withDeleted: true,
  });
  if (!item) {
    throw new Error(`Menu item "${name}" not found for restaurant ${restaurantId}`);
  }
  return item.id;
}

async function seedCustomerCart(customerId: string) {
  const cartRepo = dataSource.getRepository(CartItem);
  const hastyId = RESTAURANT_SEEDS[0].id;
  const hastyNames = RESTAURANT_SEEDS[0].menu.map((item) => item.name);

  for (const name of hastyNames) {
    const menuItemId = await findMenuItemId(hastyId, name);
    const existing = await cartRepo.findOne({
      where: { userId: customerId, menuItemId },
    });
    if (existing) {
      existing.quantity = 1;
      await cartRepo.save(existing);
    } else {
      await cartRepo.save(
        cartRepo.create({
          userId: customerId,
          menuItemId,
          quantity: 1,
        }),
      );
    }
  }

  return hastyNames.length;
}

async function upsertOrder(input: {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  lines: Array<{ menuItemId: string; itemName: string; quantity: number; unitPrice: number }>;
  estimatedMinutes?: number | null;
}) {
  const orderRepo = dataSource.getRepository(Order);
  const lineRepo = dataSource.getRepository(OrderLine);
  const statusRepo = dataSource.getRepository(DeliveryStatus);

  const subtotal = input.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const pricing = calculatePricing(subtotal);

  let order = await orderRepo.findOne({ where: { id: input.id } });
  if (!order) {
    order = orderRepo.create({ id: input.id });
  }

  order.userId = input.userId;
  order.restaurantId = input.restaurantId;
  order.restaurantName = input.restaurantName;
  order.status = input.status;
  order.deliveryAddress = CUSTOMER_ADDRESS;
  order.paymentStatus = input.paymentStatus;
  order.subtotal = pricing.subtotal;
  order.deliveryFee = pricing.deliveryFee;
  order.platformFee = pricing.platformFee;
  order.taxAmount = pricing.taxAmount;
  order.total = pricing.total;
  order.currency = pricing.currency;
  order.estimatedMinutes = input.estimatedMinutes ?? null;
  await orderRepo.save(order);

  await lineRepo.delete({ orderId: order.id });
  await lineRepo.save(
    input.lines.map((line) =>
      lineRepo.create({
        orderId: order.id,
        menuItemId: line.menuItemId,
        itemName: line.itemName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      }),
    ),
  );

  let statusRow = await statusRepo.findOne({ where: { orderId: order.id } });
  if (!statusRow) {
    statusRow = statusRepo.create({ orderId: order.id, status: input.status });
  } else {
    statusRow.status = input.status;
  }
  await statusRepo.save(statusRow);
}

async function seedOrders(customerId: string) {
  const hastyId = RESTAURANT_SEEDS[0].id;
  const burgerId = RESTAURANT_SEEDS[1].id;
  const pastaId = RESTAURANT_SEEDS[3].id;

  await upsertOrder({
    id: ORDER_IDS.placed,
    userId: customerId,
    restaurantId: hastyId,
    restaurantName: RESTAURANT_SEEDS[0].name,
    status: OrderStatus.PLACED,
    paymentStatus: OrderPaymentStatus.PENDING,
    lines: [
      {
        menuItemId: await findMenuItemId(hastyId, 'Butter Chicken'),
        itemName: 'Butter Chicken',
        quantity: 2,
        unitPrice: 225,
      },
      {
        menuItemId: await findMenuItemId(hastyId, 'Garlic Naan'),
        itemName: 'Garlic Naan',
        quantity: 1,
        unitPrice: 60,
      },
    ],
  });

  await upsertOrder({
    id: ORDER_IDS.preparing,
    userId: customerId,
    restaurantId: burgerId,
    restaurantName: RESTAURANT_SEEDS[1].name,
    status: OrderStatus.PREPARING,
    paymentStatus: OrderPaymentStatus.PAID,
    estimatedMinutes: 30,
    lines: [
      {
        menuItemId: await findMenuItemId(burgerId, 'Classic Cheeseburger'),
        itemName: 'Classic Cheeseburger',
        quantity: 2,
        unitPrice: 175,
      },
    ],
  });

  await upsertOrder({
    id: ORDER_IDS.delivered,
    userId: customerId,
    restaurantId: pastaId,
    restaurantName: RESTAURANT_SEEDS[3].name,
    status: OrderStatus.DELIVERED,
    paymentStatus: OrderPaymentStatus.PAID,
    lines: [
      {
        menuItemId: await findMenuItemId(pastaId, 'Penne Arrabbiata'),
        itemName: 'Penne Arrabbiata',
        quantity: 1,
        unitPrice: 240,
      },
      {
        menuItemId: await findMenuItemId(pastaId, 'Tiramisu'),
        itemName: 'Tiramisu',
        quantity: 1,
        unitPrice: 180,
      },
    ],
  });

  return 3;
}

async function seed() {
  await dataSource.initialize();

  const { restaurantCount, menuCount } = await seedRestaurantsAndMenus();
  const customerId = await findUserId(CUSTOMER_EMAIL);
  const cartCount = await seedCustomerCart(customerId);
  const orderCount = await seedOrders(customerId);

  console.log('');
  console.log('API seed complete — reviewers can run cold:');
  console.log(`  restaurants  ${restaurantCount}`);
  console.log(`  menu items   ${menuCount}`);
  console.log(`  cart items   ${cartCount}  (${CUSTOMER_EMAIL} @ Hasty Tasty)`);
  console.log(`  orders       ${orderCount}  (placed unpaid · preparing paid · delivered paid)`);
  console.log('');
  console.log('Demo logins (from pnpm seed):');
  console.log('  customer  customer@tastygo.com  /  User@1234   →  /restaurants  /cart  /orders');
  console.log('  staff     hasty@tastygo.com     /  Hasty@12    →  /restaurant/dashboard  /restaurant/menu');
  console.log('  admin     admin@tastygo.com     /  Admin@123   →  /admin/restaurants');
  console.log('');
  console.log('Must path needs no Razorpay / Cloudinary keys. Stretch keys are optional.');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
