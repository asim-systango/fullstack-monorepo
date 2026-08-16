import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { WarehouseEntity } from './entities/WarehouseEntity';
import { CategoryEntity } from './entities/CategoryEntity';
import { ProductEntity } from './entities/ProductEntity';
import { StockLevelEntity } from './entities/StockLevelEntity';
import { StockMovementEntity } from './entities/StockMovementEntity';
import { UserEntity } from './entities/UserEntity';

const CATEGORY_ELECTRONICS = 'Electronics';
const CATEGORY_KITCHENWARE = 'Kitchenware';
const CATEGORY_TOYS = 'Toys & Games';
const CATEGORY_APPAREL = 'Apparel & Clothing';
const UNIT_PCS = 'pcs';

async function seed() {
  await dataSource.initialize();
  const warehouseRepo = dataSource.getRepository(WarehouseEntity);
  const categoryRepo = dataSource.getRepository(CategoryEntity);
  const productRepo = dataSource.getRepository(ProductEntity);
  const stockLevelRepo = dataSource.getRepository(StockLevelEntity);
  const movementRepo = dataSource.getRepository(StockMovementEntity);
  const userRepo = dataSource.getRepository(UserEntity);

  console.log('Seeding domain data...');

  // 1. Fetch or create a default seed user
  let seedUser = await userRepo.findOne({ where: { email: 'staff@demo.local' } });
  if (!seedUser) {
    seedUser = await userRepo.save(
      userRepo.create({
        email: 'staff@demo.local',
        passwordHash: '$2a$12$KIXpTqI211Wf.XQ71Xy0e.H2Yh9yK45JjGZzE25xO8WqZ4J1Xy0e',
        name: 'Indore Warehouse Manager',
        role: 'staff',
      }),
    );
  }

  // 2. Seed Indore Warehouses
  const warehousesData = [
    {
      code: 'WH-VIJAY',
      name: 'Vijay Nagar Express Hub',
      location: 'Vijay Nagar Square, AB Road, Indore',
    },
    {
      code: 'WH-BHANWAR',
      name: 'Bhanwarkuan Fulfillment Center',
      location: 'IT Park Road, Bhanwarkuan, Indore',
    },
    {
      code: 'WH-PALASIA',
      name: 'Palasia Distribution Depot',
      location: 'Greater Palasia, Industry House, Indore',
    },
    {
      code: 'WH-SUPER',
      name: 'Super Corridor Mega Logistics',
      location: 'Super Corridor Rd, Near Airport, Indore',
    },
  ];

  const warehouseMap = new Map<string, WarehouseEntity>();
  for (const wh of warehousesData) {
    let existing = await warehouseRepo.findOne({ where: { code: wh.code } });
    if (!existing) {
      existing = await warehouseRepo.save(warehouseRepo.create(wh));
    }
    warehouseMap.set(wh.code, existing);
  }

  // Assign Vijay Nagar Warehouse to staff user if not already set
  const vijayWhForUser = warehouseMap.get('WH-VIJAY');
  if (seedUser && !seedUser.warehouseId && vijayWhForUser) {
    seedUser.warehouseId = vijayWhForUser.id;
    await userRepo.save(seedUser);
  }

  // 3. Seed Product Categories
  const categoriesData = [
    CATEGORY_ELECTRONICS,
    CATEGORY_KITCHENWARE,
    CATEGORY_TOYS,
    CATEGORY_APPAREL,
  ];

  const categoryMap = new Map<string, CategoryEntity>();
  for (const catName of categoriesData) {
    let existing = await categoryRepo.findOne({ where: { name: catName } });
    if (!existing) {
      existing = await categoryRepo.save(categoryRepo.create({ name: catName }));
    }
    categoryMap.set(catName, existing);
  }

  // 4. Seed Products (Swiggy / Blinkit e-commerce items)
  const productsData = [
    // Electronics
    {
      sku: 'SKU-ELEC-01',
      name: 'High-Speed Wireless Ergonomic Mouse',
      category: CATEGORY_ELECTRONICS,
      description: 'Dual mode 2.4Ghz & Bluetooth wireless mouse',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-ELEC-02',
      name: 'Mechanical RGB Gaming Keyboard',
      category: CATEGORY_ELECTRONICS,
      description: 'Hot-swappable blue switch mechanical keyboard',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-ELEC-03',
      name: 'Noise-Canceling Bluetooth Headphones',
      category: CATEGORY_ELECTRONICS,
      description: 'Active noise cancellation with 40h battery life',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-ELEC-04',
      name: 'Heavy Duty Desktop Computer CPU',
      category: CATEGORY_ELECTRONICS,
      description: 'Intel i7 16GB RAM 1TB SSD Workstation',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-ELEC-05',
      name: 'Studio Over-Ear Audio Headset',
      category: CATEGORY_ELECTRONICS,
      description: 'High-fidelity audio monitoring headset with mic',
      unit: UNIT_PCS,
    },

    // Kitchenware
    {
      sku: 'SKU-KITCH-01',
      name: 'Heavy-Duty 750W Mixer Grinder (3 Jars)',
      category: CATEGORY_KITCHENWARE,
      description: 'Stainless steel blades with overload protection',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-KITCH-02',
      name: 'Electric Citrus Juicer & Extractor',
      category: CATEGORY_KITCHENWARE,
      description: 'Automatic pulp control fresh fruit juicer',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-KITCH-03',
      name: 'Stainless Steel Gas Lighter Pack',
      category: CATEGORY_KITCHENWARE,
      description: 'Durable spark gas lighter with stand',
      unit: 'pack',
    },
    {
      sku: 'SKU-KITCH-04',
      name: 'Airtight Glass Storage Jars (Set of 6)',
      category: CATEGORY_KITCHENWARE,
      description: '1000ml borosilicate glass storage containers',
      unit: 'set',
    },
    {
      sku: 'SKU-KITCH-05',
      name: 'Precision Chef Kitchen Knife Set',
      category: CATEGORY_KITCHENWARE,
      description: 'High-carbon stainless steel kitchen knives',
      unit: 'set',
    },

    // Toys & Games
    {
      sku: 'SKU-TOYS-01',
      name: 'Remote Control 4WD Off-Road Car',
      category: CATEGORY_TOYS,
      description: 'Rechargeable high-speed RC stunt car',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-TOYS-02',
      name: 'Diecast Miniature Superbike Toy',
      category: CATEGORY_TOYS,
      description: '1:12 scale metal alloy motorcycle toy model',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-TOYS-03',
      name: 'Soft Foam Dart Blaster Toy Gun',
      category: CATEGORY_TOYS,
      description: 'Includes 20 soft foam darts and target board',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-TOYS-04',
      name: '500-Piece World Map Jigsaw Puzzle',
      category: CATEGORY_TOYS,
      description: 'Educational jigsaw puzzle for kids & adults',
      unit: 'box',
    },

    // Apparel & Clothing
    {
      sku: 'SKU-CLOTH-01',
      name: 'Slim Fit Dark Blue Denim Jeans',
      category: CATEGORY_APPAREL,
      description: 'Stretchable casual denim trousers',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-CLOTH-02',
      name: 'Premium Heavyweight Cotton Black T-Shirt',
      category: CATEGORY_APPAREL,
      description: '100% bio-washed crew neck cotton t-shirt',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-CLOTH-03',
      name: 'Full-Grain Genuine Leather Formal Belt',
      category: CATEGORY_APPAREL,
      description: 'Reversible black & brown leather belt',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-CLOTH-04',
      name: 'All-Weather Outdoor Windcheater Jacket',
      category: CATEGORY_APPAREL,
      description: 'Waterproof lightweight zippered jacket',
      unit: UNIT_PCS,
    },
    {
      sku: 'SKU-CLOTH-05',
      name: 'Stretchable Casual Chino Trousers',
      category: CATEGORY_APPAREL,
      description: 'Beige cotton casual slim chinos',
      unit: UNIT_PCS,
    },
  ];

  const SAMPLE_IMAGE_URLS = [
    'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U',
    'https://fastly.picsum.photos/id/30/1280/901.jpg?hmac=A_hpFyEavMBB7Dsmmp53kPXKmatwM05MUDatlWSgATE',
    'https://fastly.picsum.photos/id/89/4608/2592.jpg?hmac=G9E4z5RMJgMUjgTzeR4CFlORjvogsGtqFQozIRqugBk',
    'https://fastly.picsum.photos/id/84/1280/848.jpg?hmac=YFRYDI4UsfbeTzI8ZakNOR98wVU7a-9a2tGF542539s',
    'https://fastly.picsum.photos/id/96/4752/3168.jpg?hmac=KNXudB1q84CHl2opIFEY4ph12da5JD5GzKzH5SeuRVM',
    'https://fastly.picsum.photos/id/119/3264/2176.jpg?hmac=PYRYBOGQhlUm6wS94EkpN8dTIC7-2GniC3pqOt6CpNU',
  ];

  const productMap = new Map<string, ProductEntity>();
  for (const [idx, p] of productsData.entries()) {
    const imgUrl = SAMPLE_IMAGE_URLS[idx % SAMPLE_IMAGE_URLS.length];
    let existing = await productRepo.findOne({ where: { sku: p.sku } });
    const category = categoryMap.get(p.category);
    if (!existing && category) {
      existing = await productRepo.save(
        productRepo.create({
          sku: p.sku,
          name: p.name,
          categoryId: category.id,
          description: p.description,
          unit: p.unit,
          imageUrl: imgUrl,
        }),
      );
    } else if (existing) {
      existing.imageUrl = imgUrl;
      existing = await productRepo.save(existing);
    }
    if (existing) {
      productMap.set(p.sku, existing);
    }
  }

  // 5. Seed Initial Stock Levels across Indore Hubs
  const vijayWh = warehouseMap.get('WH-VIJAY')!;
  const bhanwarWh = warehouseMap.get('WH-BHANWAR')!;
  const palasiaWh = warehouseMap.get('WH-PALASIA')!;
  const superWh = warehouseMap.get('WH-SUPER')!;

  const stockInitialData = [
    // Vijay Nagar Hub
    { wh: vijayWh, sku: 'SKU-ELEC-01', qty: 45 },
    { wh: vijayWh, sku: 'SKU-ELEC-02', qty: 25 },
    { wh: vijayWh, sku: 'SKU-ELEC-03', qty: 4 },
    { wh: vijayWh, sku: 'SKU-KITCH-01', qty: 18 },
    { wh: vijayWh, sku: 'SKU-KITCH-03', qty: 60 },
    { wh: vijayWh, sku: 'SKU-TOYS-01', qty: 30 },
    { wh: vijayWh, sku: 'SKU-CLOTH-01', qty: 50 },

    // Bhanwarkuan Hub
    { wh: bhanwarWh, sku: 'SKU-ELEC-01', qty: 20 },
    { wh: bhanwarWh, sku: 'SKU-ELEC-04', qty: 3 },
    { wh: bhanwarWh, sku: 'SKU-KITCH-02', qty: 12 },
    { wh: bhanwarWh, sku: 'SKU-TOYS-02', qty: 22 },
    { wh: bhanwarWh, sku: 'SKU-CLOTH-02', qty: 80 },

    // Palasia Depot
    { wh: palasiaWh, sku: 'SKU-ELEC-05', qty: 15 },
    { wh: palasiaWh, sku: 'SKU-KITCH-04', qty: 35 },
    { wh: palasiaWh, sku: 'SKU-TOYS-03', qty: 5 },
    { wh: palasiaWh, sku: 'SKU-CLOTH-03', qty: 28 },

    // Super Corridor Mega Logistics
    { wh: superWh, sku: 'SKU-ELEC-02', qty: 50 },
    { wh: superWh, sku: 'SKU-KITCH-05', qty: 40 },
    { wh: superWh, sku: 'SKU-TOYS-04', qty: 25 },
    { wh: superWh, sku: 'SKU-CLOTH-04', qty: 6 },
    { wh: superWh, sku: 'SKU-CLOTH-05', qty: 35 },
  ];

  for (const item of stockInitialData) {
    const product = productMap.get(item.sku);
    if (product) {
      const level = await stockLevelRepo.findOne({
        where: { warehouseId: item.wh.id, productId: product.id },
      });
      if (!level) {
        await stockLevelRepo.save(
          stockLevelRepo.create({
            warehouseId: item.wh.id,
            productId: product.id,
            quantity: item.qty,
          }),
        );

        // Record Initial Inbound Audit Movement
        await movementRepo.save(
          movementRepo.create({
            warehouseId: item.wh.id,
            productId: product.id,
            type: 'inbound',
            quantity: item.qty,
            reason: 'Initial stock intake into Indore regional hub',
            userId: seedUser.id,
          }),
        );
      }
    }
  }

  console.log(
    'Domain seed complete: 4 Indore Warehouses, 4 Categories, 19 Products, 21 Stock Levels & Audit Movements populated successfully.',
  );
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
