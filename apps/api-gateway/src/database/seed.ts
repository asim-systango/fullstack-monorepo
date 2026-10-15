import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { Role, User } from '../modules/users';

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);

  const seeds = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@pulsecare.com',
      firstName: 'PulseCare',
      lastName: 'Admin',
      name: 'PulseCare Admin',
      password: 'Test@123',
      role: Role.ADMIN,
      phone: '+1000000011',
    },
  ];

  for (const row of seeds) {
    const existing = await users.findOne({ where: { email: row.email } });
    const passwordHash = await bcrypt.hash(row.password, 12);
    if (!existing) {
      await users.save(
        users.create({
          id: row.id,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          name: row.name,
          phone: row.phone,
          passwordHash,
          role: row.role,
          isActive: true,
          emailVerified: true,
        }),
      );
    } else {
      await users.update(existing.id, {
        firstName: row.firstName,
        lastName: row.lastName,
        name: row.name,
        phone: row.phone,
        passwordHash,
        role: row.role,
        isActive: true,
      });
    }
  }

  console.log('API-Gateway seed complete — created accounts:');
  seeds.forEach((s) =>
    console.log(` - ${s.email} (${s.role}) / Password: ${s.password}`),
  );

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
