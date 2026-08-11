import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { User } from '../modules/users';

/** Stable UUIDs so apps/api seed can provision member_profile mirrors. */
export const SEED_ADMIN_USER_ID = '00000000-0000-4000-8000-0000000000a1';
export const SEED_MEMBER_USER_ID = '00000000-0000-4000-8000-0000000000b1';
export const SEED_STAFF_USER_ID = '00000000-0000-4000-8000-000000000001';

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password123', 12);
  const verifiedAt = new Date();

  const seeds: Array<{
    id: string;
    email: string;
    name: string;
    role: User['role'];
  }> = [
    {
      id: SEED_ADMIN_USER_ID,
      email: 'admin@demo.local',
      name: 'Demo Admin',
      role: 'admin',
    },
    {
      id: SEED_MEMBER_USER_ID,
      email: 'user@demo.local',
      name: 'Demo User',
      role: 'user',
    },
    {
      id: SEED_STAFF_USER_ID,
      email: 'staff@demo.local',
      name: 'Demo Staff',
      role: 'staff',
    },
  ];

  for (const row of seeds) {
    const existing = await users.findOne({ where: { email: row.email } });
    if (!existing) {
      await users.save(
        users.create({
          id: row.id,
          email: row.email,
          name: row.name,
          passwordHash,
          role: row.role,
          emailVerifiedAt: verifiedAt,
          otpAttempts: 0,
        }),
      );
    } else if (!existing.emailVerifiedAt) {
      existing.emailVerifiedAt = verifiedAt;
      await users.save(existing);
    }
  }

  console.log('Seed complete — password for all: password123', {
    emails: seeds.map((s) => s.email),
    ids: seeds.map((s) => ({ email: s.email, id: s.id })),
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
