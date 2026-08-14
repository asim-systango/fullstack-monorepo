import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { MenuItem } from '../modules/restaurants/menu-item.entity';
import { Restaurant, RestaurantDietType } from '../modules/restaurants/restaurant.entity';

const RESTAURANT_SEEDS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    ownerEmail: 'hasty@tastygo.com',
    name: 'Hasty Tasty',
    cuisine: 'Indian',
    address: '142 Rajwada Road, Indore',
    description: 'Homestyle curries and fresh naan.',
    emoji: '🍛',
    rating: 4.6,
    eta: '25-35 min',
    dietType: RestaurantDietType.BOTH,
    menu: [
      { name: 'Butter Chicken', description: 'Creamy tomato curry, served with rice', price: 225 },
      { name: 'Garlic Naan', description: 'Tandoor-baked flatbread', price: 60 },
      { name: 'Paneer Tikka', description: 'Char-grilled cottage cheese skewers', price: 210 },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils', price: 180 },
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
    rating: 4.3,
    eta: '20-30 min',
    dietType: RestaurantDietType.NON_VEG,
    menu: [
      { name: 'Classic Cheeseburger', description: 'Double patty, cheddar', price: 175 },
      { name: 'Crispy Fries', description: 'Salted shoestring fries', price: 120 },
      { name: 'Chicken Wrap', description: 'Grilled chicken wrap', price: 160 },
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
      { name: "Chef's Platter", description: 'Assorted nigiri and rolls', price: 890 },
      { name: 'Salmon Roll', description: 'Fresh salmon maki', price: 320 },
      { name: 'Miso Soup', description: 'Traditional soybean soup', price: 90 },
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
    rating: 4.4,
    eta: '25-35 min',
    dietType: RestaurantDietType.BOTH,
    menu: [
      { name: 'Penne Arrabbiata', description: 'Spicy tomato pasta', price: 240 },
      { name: 'Garlic Bread', description: 'Toasted with herbs', price: 80 },
      { name: 'Tiramisu', description: 'Classic Italian dessert', price: 180 },
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
    rating: 4.5,
    eta: '20-30 min',
    dietType: RestaurantDietType.VEG,
    menu: [
      { name: 'Pani Puri', description: 'Crispy puris with spicy water', price: 70 },
      { name: 'Veg Thali', description: 'Full plate with roti and rice', price: 199 },
      { name: 'Masala Chai', description: 'Spiced milk tea', price: 40 },
    ],
  },
] as const;

async function findOwnerId(email: string): Promise<string> {
  const rows: Array<{ id: string }> = await dataSource.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  const owner = rows[0];
  if (!owner) {
    throw new Error(
      `Staff user ${email} not found. Run gateway seed first: pnpm seed`,
    );
  }
  return owner.id;
}

async function seed() {
  await dataSource.initialize();
  const restaurantRepo = dataSource.getRepository(Restaurant);
  const menuRepo = dataSource.getRepository(MenuItem);

  for (const row of RESTAURANT_SEEDS) {
    const ownerUserId = await findOwnerId(row.ownerEmail);
    let restaurant = await restaurantRepo.findOne({ where: { id: row.id } });

    if (!restaurant) {
      restaurant = restaurantRepo.create({
        id: row.id,
        ownerUserId,
        name: row.name,
        cuisine: row.cuisine,
        address: row.address,
        description: row.description,
        emoji: row.emoji,
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
      restaurant.rating = row.rating;
      restaurant.eta = row.eta;
      restaurant.dietType = row.dietType;
    }

    await restaurantRepo.save(restaurant);

    for (const item of row.menu) {
      const existing = await menuRepo.findOne({
        where: { restaurantId: restaurant.id, name: item.name },
        withDeleted: true,
      });

      if (existing) {
        existing.description = item.description;
        existing.price = item.price;
        if (existing.deletedAt) {
          await menuRepo.recover(existing);
        } else {
          await menuRepo.save(existing);
        }
      } else {
        await menuRepo.save(
          menuRepo.create({
            restaurantId: restaurant.id,
            name: item.name,
            description: item.description,
            price: item.price,
          }),
        );
      }
    }

    console.log(`  restaurant  ${row.name}  ←  ${row.ownerEmail}`);
  }

  console.log('API seed complete — 5 restaurants + menus.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
