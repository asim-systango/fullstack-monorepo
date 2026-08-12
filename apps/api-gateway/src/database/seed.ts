import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { User } from '../modules/users';

/**
 * Demo accounts for Swagger / local testing.
 * Passwords: min 8 chars, upper + lower + number + special.
 * Restaurant/menu data is seeded by apps/api (`pnpm seed:api`).
 */
export const DEMO_ACCOUNTS = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@tastygo.com',
    name: 'Platform Admin',
    role: 'admin' as const,
    password: 'Admin@123',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'customer@tastygo.com',
    name: 'Demo Customer',
    role: 'user' as const,
    password: 'User@1234',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'hasty@tastygo.com',
    name: 'Hasty Tasty Staff',
    role: 'staff' as const,
    password: 'Hasty@12',
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    email: 'burger@tastygo.com',
    name: 'Burger Barn Staff',
    role: 'staff' as const,
    password: 'Burger@1',
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    email: 'sushi@tastygo.com',
    name: 'Sushi Sagara Staff',
    role: 'staff' as const,
    password: 'Sushi@12',
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    email: 'pasta@tastygo.com',
    name: 'Pasta Piazza Staff',
    role: 'staff' as const,
    password: 'Pasta@12',
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    email: 'spice@tastygo.com',
    name: 'Spice Route Staff',
    role: 'staff' as const,
    password: 'Spice@12',
  },
] as const;

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);

  for (const row of DEMO_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(row.password, 12);

    let existing = await users.findOne({ where: { id: row.id } });
    if (!existing) {
      existing = await users.findOne({ where: { email: row.email } });
    }

    if (existing) {
      existing.email = row.email;
      existing.name = row.name;
      existing.role = row.role;
      existing.passwordHash = passwordHash;
      await users.save(existing);
    } else {
      await users.save(
        users.create({
          id: row.id,
          email: row.email,
          name: row.name,
          passwordHash,
          role: row.role,
        }),
      );
    }
  }

  console.log('Gateway seed complete — users:');
  for (const row of DEMO_ACCOUNTS) {
    console.log(`  ${row.role.padEnd(6)}  ${row.email}  /  ${row.password}`);
  }
  console.log('Next: pnpm seed:api  (restaurants + menus)');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
