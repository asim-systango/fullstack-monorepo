import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Auction } from '../modules/auctions/auctions.entity';
import { Bid } from '../modules/bids/bids.entity';
import { User } from '../modules/users/user.entity';

const SEED_MARKER = '[seed] Vintage Film Camera';

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const auctions = dataSource.getRepository(Auction);
  const bids = dataSource.getRepository(Bid);

  const seller = await users.findOne({ where: { email: 'staff@demo.local' } });
  const bidder = await users.findOne({ where: { email: 'user@demo.local' } });
  const bidder2 = await users.findOne({ where: { email: 'admin@demo.local' } });

  if (!seller || !bidder || !bidder2) {
    throw new Error(
      'Demo users missing. Run `pnpm seed` (gateway) first so staff@demo.local, user@demo.local, and admin@demo.local exist.',
    );
  }

  const already = await auctions.findOne({ where: { title: SEED_MARKER } });
  if (already) {
    console.log('Domain seed already applied — skipping');
    await dataSource.destroy();
    return;
  }

  const daysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };
  const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  const open1 = await auctions.save(
    auctions.create({
      title: SEED_MARKER,
      description: 'Fully working 35mm film camera with original case.',
      category: 'electronics',
      startingPrice: '500.00',
      minIncrement: '50.00',
      currentPrice: '650.00',
      endsAt: daysFromNow(7),
      status: 'open',
      sellerId: seller.id,
      winnerId: null,
    }),
  );

  const open2 = await auctions.save(
    auctions.create({
      title: '[seed] Mechanical Wristwatch',
      description: 'Automatic movement, recently serviced.',
      category: 'fashion',
      startingPrice: '1200.00',
      minIncrement: '100.00',
      currentPrice: '1400.00',
      endsAt: daysFromNow(5),
      status: 'open',
      sellerId: seller.id,
      winnerId: null,
    }),
  );

  const open3 = await auctions.save(
    auctions.create({
      title: '[seed] Mid-century Desk Lamp',
      description: 'Brass desk lamp, warm light, minor patina.',
      category: 'home',
      startingPrice: '300.00',
      minIncrement: '25.00',
      currentPrice: '300.00',
      endsAt: daysFromNow(10),
      status: 'open',
      sellerId: seller.id,
      winnerId: null,
    }),
  );

  const closed = await auctions.save(
    auctions.create({
      title: '[seed] Signed First Edition Novel',
      description: 'First printing, signed by the author on the title page.',
      category: 'books',
      startingPrice: '800.00',
      minIncrement: '75.00',
      currentPrice: '1025.00',
      endsAt: daysAgo(1),
      status: 'closed',
      sellerId: seller.id,
      winnerId: bidder.id,
    }),
  );

  const cancelled = await auctions.save(
    auctions.create({
      title: '[seed] Counterfeit Sports Jersey',
      description: 'Listing removed — item authenticity disputed.',
      category: 'sports',
      startingPrice: '200.00',
      minIncrement: '20.00',
      currentPrice: '240.00',
      endsAt: daysFromNow(3),
      status: 'cancelled',
      sellerId: seller.id,
      winnerId: null,
    }),
  );

  // 8 bids across the seeded auctions
  const bidRows: Array<{ auctionId: string; bidderId: string; bidAmount: string }> = [
    { auctionId: open1.id, bidderId: bidder.id, bidAmount: '500.00' },
    { auctionId: open1.id, bidderId: bidder2.id, bidAmount: '550.00' },
    { auctionId: open1.id, bidderId: bidder.id, bidAmount: '650.00' },
    { auctionId: open2.id, bidderId: bidder.id, bidAmount: '1200.00' },
    { auctionId: open2.id, bidderId: bidder2.id, bidAmount: '1400.00' },
    { auctionId: closed.id, bidderId: bidder2.id, bidAmount: '800.00' },
    { auctionId: closed.id, bidderId: bidder.id, bidAmount: '1025.00' },
    { auctionId: cancelled.id, bidderId: bidder.id, bidAmount: '240.00' },
  ];

  for (const row of bidRows) {
    await bids.save(bids.create(row));
  }

  console.log('Domain seed complete', {
    auctions: [open1, open2, open3, closed, cancelled].map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
    })),
    bids: bidRows.length,
    seller: seller.email,
    bidders: [bidder.email, bidder2.email],
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
