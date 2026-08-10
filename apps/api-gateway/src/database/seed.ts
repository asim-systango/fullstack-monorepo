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
      id: '00000000-0000-0000-0000-000000000000',
      email: 'admin@hospital.com',
      firstName: 'Admin',
      lastName: 'User',
      name: 'System Admin',
      password: 'Admin@123',
      role: Role.ADMIN,
      phone: '+1000000001',
    },
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'doctor@hospital.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      name: 'Dr. Sarah Jenkins',
      password: 'Doctor@123',
      role: Role.DOCTOR,
      phone: '+1000000002',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'doctor2@hospital.com',
      firstName: 'Michael',
      lastName: 'Chen',
      name: 'Dr. Michael Chen',
      password: 'Doctor@123',
      role: Role.DOCTOR,
      phone: '+1000000003',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'patient@hospital.com',
      firstName: 'Jane',
      lastName: 'Doe',
      name: 'Jane Doe',
      password: 'Patient@123',
      role: Role.PATIENT,
      phone: '+1000000004',
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
