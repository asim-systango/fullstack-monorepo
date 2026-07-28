import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { User } from '../modules/users/user.entity';

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password123', 12);

  const seeds: Array<{ email: string; name: string; role: User['role'] }> = [
    { email: 'admin@demo.local', name: 'Demo Admin', role: 'admin' },
    { email: 'user@demo.local', name: 'Demo User', role: 'user' },
    { email: 'staff@demo.local', name: 'Demo Staff', role: 'staff' },
  ];

  for (const row of seeds) {
    const existing = await users.findOne({ where: { email: row.email } });
    if (!existing) {
      await users.save(
        users.create({
          email: row.email,
          name: row.name,
          passwordHash,
          role: row.role,
        }),
      );
    }
  }

  console.log('Seed complete — password for all: password123', {
    emails: seeds.map((s) => s.email),
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
