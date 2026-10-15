import 'reflect-metadata';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { Hotel } from '../../modules/hotels/hotel.entity';
import { Room } from '../../modules/rooms/room.entity';
import { Booking } from '../../modules/bookings/booking.entity';
import { Review } from '../../modules/reviews/review.entity';
import { PaymentIntent } from '../../modules/payments/payment-intent.entity';

/**
 * Domain seed script for Hotel Booking project.
 *
 * Run after: pnpm seed (gateway users) + pnpm migration:run:api (domain tables)
 * Usage: npx ts-node -r tsconfig-paths/register apps/api/src/database/seeds/hotel-seed.ts
 *
 * Uses the gateway's seeded users:
 *  - admin@demo.local  (admin)
 *  - staff@demo.local  (staff / hotel_manager)
 *  - user@demo.local   (user / guest)
 */

async function seed() {
  // Load env same way as apps/api
  const envPath = resolve(__dirname, '../../../.env');
  const rootEnv = resolve(__dirname, '../../../../../.env');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: envPath });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: rootEnv });

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const ds = new DataSource({
    type: 'postgres',
    url,
    entities: [Hotel, Room, Booking, Review, PaymentIntent],
    synchronize: false,
  });

  await ds.initialize();
  console.log('Connected to database');

  // --- Step 1: Look up gateway user IDs ---
  const userRows: Array<{ id: string; role: string }> = await ds.query(
    `SELECT id, role FROM users WHERE email IN ($1, $2, $3)`,
    ['admin@demo.local', 'staff@demo.local', 'user@demo.local'],
  );

  const findUser = (role: string) => {
    const u = userRows.find((r) => r.role === role);
    if (!u) throw new Error(`No ${role} user found — run 'pnpm seed' first`);
    return u.id;
  };

  const adminId = findUser('admin');
  const staffId = findUser('staff');
  const guestId = findUser('user');

  console.log(`Users: admin=${adminId}, staff=${staffId}, guest=${guestId}`);

  // --- Step 2: Create Hotels ---
  const hotelRepo = ds.getRepository(Hotel);
  const hotels = hotelRepo.create([
    {
      name: 'The Grand Residency',
      description:
        'A luxurious 5-star hotel in the heart of Mumbai with rooftop pool and fine dining.',
      city: 'Mumbai',
      address: '123 Marine Drive, Colaba, Mumbai 400001',
      imageUrl: null,
      managerId: staffId,
    },
    {
      name: 'Coastal Breeze Resort',
      description:
        'A beachfront resort in Goa offering serene ocean views and water sports.',
      city: 'Goa',
      address: '45 Calangute Beach Road, North Goa 403516',
      imageUrl: null,
      managerId: staffId,
    },
    {
      name: 'Mountain View Lodge',
      description: 'A cozy mountain retreat in Shimla with panoramic Himalayan views.',
      city: 'Shimla',
      address: '78 Mall Road, Shimla 171001',
      imageUrl: null,
      managerId: adminId,
    },
  ]);
  const savedHotels = await hotelRepo.save(hotels);
  const [hotel1, hotel2, hotel3] = savedHotels as [Hotel, Hotel, Hotel];
  console.log(`Created ${savedHotels.length} hotels`);

  // --- Step 3: Create Rooms (2 per hotel) ---
  const roomRepo = ds.getRepository(Room);
  const rooms = roomRepo.create([
    // Grand Residency
    {
      hotelId: hotel1.id,
      name: 'Standard Double',
      type: 'double',
      pricePerNight: 8500, // ₹85.00
      capacity: 2,
      amenities: 'WiFi, AC, TV, Mini Bar',
      isActive: true,
    },
    {
      hotelId: hotel1.id,
      name: 'Presidential Suite',
      type: 'suite',
      pricePerNight: 25000, // ₹250.00
      capacity: 4,
      amenities: 'WiFi, AC, TV, Mini Bar, Jacuzzi, Living Room, Butler Service',
      isActive: true,
    },
    // Coastal Breeze
    {
      hotelId: hotel2.id,
      name: 'Ocean View Single',
      type: 'single',
      pricePerNight: 5000, // ₹50.00
      capacity: 1,
      amenities: 'WiFi, AC, TV, Beach Access',
      isActive: true,
    },
    {
      hotelId: hotel2.id,
      name: 'Beach Villa Suite',
      type: 'suite',
      pricePerNight: 18000, // ₹180.00
      capacity: 3,
      amenities: 'WiFi, AC, TV, Private Pool, Beach Access, Spa',
      isActive: true,
    },
    // Mountain View Lodge
    {
      hotelId: hotel3.id,
      name: 'Cozy Double Room',
      type: 'double',
      pricePerNight: 4500, // ₹45.00
      capacity: 2,
      amenities: 'WiFi, Heater, TV, Mountain View',
      isActive: true,
    },
    {
      hotelId: hotel3.id,
      name: 'Deluxe Mountain Suite',
      type: 'suite',
      pricePerNight: 12000, // ₹120.00
      capacity: 4,
      amenities: 'WiFi, Heater, TV, Fireplace, Balcony, Mountain View',
      isActive: true,
    },
  ]);
  const savedRooms = await roomRepo.save(rooms);
  const [room1, room2, room3, , room5] = savedRooms as [
    Room,
    Room,
    Room,
    Room,
    Room,
    Room,
  ];
  console.log(`Created ${savedRooms.length} rooms`);

  // --- Step 4: Create Bookings ---

  // Helper: create booking + payment in transaction
  async function createBookingWithPayment(bookingData: Partial<Booking>) {
    return ds.transaction(async (manager) => {
      const booking = manager.getRepository(Booking).create(bookingData);
      const saved = await manager.getRepository(Booking).save(booking);
      const pi = manager.getRepository(PaymentIntent).create({
        bookingId: saved.id,
        amount: saved.totalPrice,
        status: saved.status === 'cancelled' ? 'refunded' : 'paid',
        provider: 'mock',
      });
      await manager.getRepository(PaymentIntent).save(pi);
      return saved;
    });
  }

  await createBookingWithPayment({
    roomId: room1.id, // Standard Double at Grand Residency
    userId: guestId,
    checkIn: '2026-08-10',
    checkOut: '2026-08-13',
    status: 'confirmed',
    totalPrice: 8500 * 3,
  });

  const booking2 = await createBookingWithPayment({
    roomId: room3.id, // Ocean View Single at Coastal Breeze
    userId: guestId,
    checkIn: '2026-07-01',
    checkOut: '2026-07-05',
    status: 'completed',
    totalPrice: 5000 * 4,
  });

  await createBookingWithPayment({
    roomId: room5.id, // Cozy Double at Mountain View
    userId: guestId,
    checkIn: '2026-07-15',
    checkOut: '2026-07-18',
    status: 'cancelled',
    totalPrice: 4500 * 3,
  });

  await createBookingWithPayment({
    roomId: room2.id, // Presidential Suite at Grand Residency
    userId: adminId,
    checkIn: '2026-08-20',
    checkOut: '2026-08-25',
    status: 'confirmed',
    totalPrice: 25000 * 5,
  });

  console.log('Created 4 bookings with payment intents');

  // --- Step 5: Create Reviews (on completed stays) ---
  const reviewRepo = ds.getRepository(Review);
  const reviews = reviewRepo.create([
    {
      hotelId: hotel2.id, // Coastal Breeze
      userId: guestId,
      bookingId: booking2.id,
      rating: 5,
      comment:
        'Absolutely stunning resort! The ocean views from the room were breathtaking. Staff was incredibly hospitable.',
    },
    {
      hotelId: hotel1.id, // Grand Residency
      userId: adminId,
      bookingId: null,
      rating: 4,
      comment:
        'Great location in Mumbai. Rooms are well-maintained and the rooftop restaurant is excellent.',
    },
    {
      hotelId: hotel3.id, // Mountain View Lodge
      userId: guestId,
      bookingId: null,
      rating: 4,
      comment:
        'Beautiful mountain views and very cozy rooms. The fireplace suite is a must-try in winter.',
    },
  ]);
  await reviewRepo.save(reviews);
  console.log(`Created ${reviews.length} reviews`);

  console.log('\n✅ Hotel booking domain seed complete!');
  console.log('Summary:');
  console.log(`  Hotels:          ${savedHotels.length}`);
  console.log(`  Rooms:           ${savedRooms.length}`);
  console.log(`  Bookings:        4`);
  console.log(`  Payment Intents: 4`);
  console.log(`  Reviews:         ${reviews.length}`);
  console.log(
    `  Total rows:      ${savedHotels.length + savedRooms.length + 4 + 4 + reviews.length}`,
  );

  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
