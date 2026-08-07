import type {
  CartLine,
  MenuItem,
  Order,
  Restaurant,
} from '@/lib/types/food-delivery';

export const DEMO_USER_IDS = {
  admin: '00000000-0000-4000-8000-000000000001',
  staff: '00000000-0000-4000-8000-000000000002',
  user: '00000000-0000-4000-8000-000000000003',
  staff2: '00000000-0000-4000-8000-000000000004',
} as const;

export const RESTAURANT_IDS = {
  hasty: '11111111-1111-4111-8111-111111111111',
  burger: '22222222-2222-4222-8222-222222222222',
  sushi: '33333333-3333-4333-8333-333333333333',
  pasta: '44444444-4444-4444-8444-444444444444',
} as const;

export const MENU_IDS = {
  butterChicken: 'm1111111-1111-4111-8111-111111111111',
  garlicNaan: 'm1111111-1111-4111-8111-111111111112',
  paneerTikka: 'm1111111-1111-4111-8111-111111111113',
  dalMakhani: 'm1111111-1111-4111-8111-111111111114',
  seasonalLassi: 'm1111111-1111-4111-8111-111111111115',
  cheeseburger: 'm2222222-2222-4222-8222-222222222221',
  fries: 'm2222222-2222-4222-8222-222222222222',
  chefPlatter: 'm3333333-3333-4333-8333-333333333331',
} as const;

export const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: RESTAURANT_IDS.hasty,
    ownerUserId: DEMO_USER_IDS.staff,
    name: 'Hasty Tasty',
    cuisine: 'Indian',
    address: '142 Rajwada Road, Indore',
    description: 'Homestyle curries and fresh naan.',
    emoji: '🍛',
    rating: 4.6,
    eta: '25-35 min',
  },
  {
    id: RESTAURANT_IDS.burger,
    ownerUserId: DEMO_USER_IDS.staff2,
    name: 'Burger Barn',
    cuisine: 'American',
    address: '88 FC Road, Indore',
    description: 'Smash burgers and crispy fries.',
    emoji: '🍔',
    rating: 4.3,
    eta: '20-30 min',
  },
  {
    id: RESTAURANT_IDS.sushi,
    ownerUserId: DEMO_USER_IDS.staff2,
    name: 'Sushi Sagara',
    cuisine: 'Japanese',
    address: '12 Sakura Lane, Indore',
    description: 'Fresh rolls and chef platters.',
    emoji: '🍣',
    rating: 4.8,
    eta: '30-40 min',
  },
  {
    id: RESTAURANT_IDS.pasta,
    ownerUserId: DEMO_USER_IDS.staff2,
    name: 'Pasta Piazza',
    cuisine: 'Italian',
    address: '5 Roma Street, Indore',
    description: 'Handmade pasta and wood-fired sauces.',
    emoji: '🍝',
    rating: 4.4,
    eta: '25-35 min',
  },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: MENU_IDS.butterChicken,
    restaurantId: RESTAURANT_IDS.hasty,
    name: 'Butter Chicken',
    description: 'Creamy tomato curry, served with rice',
    price: 225,
  },
  {
    id: MENU_IDS.garlicNaan,
    restaurantId: RESTAURANT_IDS.hasty,
    name: 'Garlic Naan',
    description: 'Tandoor-baked flatbread',
    price: 60,
  },
  {
    id: MENU_IDS.paneerTikka,
    restaurantId: RESTAURANT_IDS.hasty,
    name: 'Paneer Tikka',
    description: 'Char-grilled cottage cheese skewers',
    price: 210,
  },
  {
    id: MENU_IDS.dalMakhani,
    restaurantId: RESTAURANT_IDS.hasty,
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils',
    price: 180,
  },
  {
    id: MENU_IDS.seasonalLassi,
    restaurantId: RESTAURANT_IDS.hasty,
    name: 'Seasonal Lassi',
    description: 'Rotated off menu last week',
    price: 90,
    deletedAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: MENU_IDS.cheeseburger,
    restaurantId: RESTAURANT_IDS.burger,
    name: 'Classic Cheeseburger',
    description: 'Double patty, cheddar',
    price: 175,
  },
  {
    id: MENU_IDS.fries,
    restaurantId: RESTAURANT_IDS.burger,
    name: 'Crispy Fries',
    description: 'Salted shoestring fries',
    price: 120,
  },
  {
    id: MENU_IDS.chefPlatter,
    restaurantId: RESTAURANT_IDS.sushi,
    name: "Chef's Platter",
    description: 'Assorted nigiri and rolls',
    price: 890,
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'o1111111-1111-4111-8111-111111111111',
    userId: DEMO_USER_IDS.user,
    restaurantId: RESTAURANT_IDS.hasty,
    restaurantName: 'Hasty Tasty',
    status: 'out_for_delivery',
    deliveryAddress: '21 MG Road, Apt 4B, Indore',
    paymentStatus: 'paid',
    subtotal: 450,
    deliveryFee: 40,
    platformFee: 22.5,
    taxAmount: 25.63,
    total: 538.13,
    currency: 'INR',
    estimatedMinutes: 30,
    createdAt: new Date().toISOString(),
    lines: [
      {
        id: 'ol-1',
        menuItemId: MENU_IDS.butterChicken,
        itemName: 'Butter Chicken',
        quantity: 2,
        unitPrice: 225,
      },
      {
        id: 'ol-2',
        menuItemId: MENU_IDS.garlicNaan,
        itemName: 'Garlic Naan',
        quantity: 1,
        unitPrice: 60,
      },
    ],
    deliveryStatuses: [
      { id: 'ds-1', status: 'placed', createdAt: new Date(Date.now() - 40 * 60000).toISOString() },
      { id: 'ds-2', status: 'preparing', createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
      {
        id: 'ds-3',
        status: 'out_for_delivery',
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
    ],
  },
  {
    id: 'o2222222-2222-4222-8222-222222222222',
    userId: DEMO_USER_IDS.user,
    restaurantId: RESTAURANT_IDS.burger,
    restaurantName: 'Burger Barn',
    status: 'delivered',
    deliveryAddress: '21 MG Road, Apt 4B, Indore',
    paymentStatus: 'paid',
    subtotal: 350,
    deliveryFee: 40,
    platformFee: 17.5,
    taxAmount: 20.35,
    total: 427.85,
    currency: 'INR',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lines: [
      {
        id: 'ol-3',
        menuItemId: MENU_IDS.cheeseburger,
        itemName: 'Classic Cheeseburger',
        quantity: 2,
        unitPrice: 175,
      },
    ],
    deliveryStatuses: [
      { id: 'ds-4', status: 'placed', createdAt: new Date(Date.now() - 90000000).toISOString() },
      { id: 'ds-5', status: 'preparing', createdAt: new Date(Date.now() - 88000000).toISOString() },
      {
        id: 'ds-6',
        status: 'out_for_delivery',
        createdAt: new Date(Date.now() - 87000000).toISOString(),
      },
      { id: 'ds-7', status: 'delivered', createdAt: new Date(Date.now() - 85000000).toISOString() },
    ],
  },
  {
    id: 'o3333333-3333-4333-8333-333333333333',
    userId: DEMO_USER_IDS.user,
    restaurantId: RESTAURANT_IDS.sushi,
    restaurantName: 'Sushi Sagara',
    status: 'cancelled',
    deliveryAddress: '21 MG Road, Apt 4B, Indore',
    paymentStatus: 'paid',
    subtotal: 890,
    deliveryFee: 0,
    platformFee: 44.5,
    taxAmount: 46.73,
    total: 981.23,
    currency: 'INR',
    createdAt: '2026-08-01T14:10:00.000Z',
    lines: [
      {
        id: 'ol-4',
        menuItemId: MENU_IDS.chefPlatter,
        itemName: "Chef's Platter",
        quantity: 1,
        unitPrice: 890,
      },
    ],
    deliveryStatuses: [
      { id: 'ds-8', status: 'placed', createdAt: '2026-08-01T14:10:00.000Z' },
      { id: 'ds-9', status: 'cancelled', createdAt: '2026-08-01T14:25:00.000Z' },
    ],
  },
];

export const SEED_CART: CartLine[] = [];

export function createMockStore() {
  return {
    restaurants: [...SEED_RESTAURANTS],
    menuItems: [...SEED_MENU_ITEMS],
    cart: [...SEED_CART],
    orders: [...SEED_ORDERS],
    currentUserId: DEMO_USER_IDS.user as string,
  };
}

export type MockStore = ReturnType<typeof createMockStore>;
