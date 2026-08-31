import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { User, UserRole } from '../modules/users';

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password123', 12);

  // Two staff accounts so the domain seed can create two companies.
  const seeds: Array<{ email: string; name: string; role: UserRole }> = [
    { email: 'admin@demo.local', name: 'Demo Admin', role: UserRole.ADMIN },
    { email: 'user@demo.local', name: 'Demo User', role: UserRole.USER },
    { email: 'user2@demo.local', name: 'Demo User Two', role: UserRole.USER },
    { email: 'staff@demo.local', name: 'Demo Staff', role: UserRole.STAFF },
    { email: 'staff2@demo.local', name: 'Demo Staff Two', role: UserRole.STAFF },
  ];

  for (const row of seeds) {
    const existing = await users.findOne({ where: { email: row.email } });
    if (!existing) {
      await users.save(
        users.create({
          email: row.email,
          name: row.name,
          password_hash: passwordHash,
          role: row.role,
        }),
      );
    }
  }

  console.log('Gateway seed complete — password for all: password123', {
    emails: seeds.map((s) => s.email),
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
