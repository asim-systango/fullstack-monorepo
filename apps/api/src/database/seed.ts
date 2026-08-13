import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Hospital } from '../modules/hospital/entities/hospital.entity';
import { HospitalBranch } from '../modules/hospital/entities/hospital-branch.entity';
import { UserRole } from '../modules/auth/entities/user-role.entity';

async function seed() {
  console.log('🌱 Starting Enterprise Clean Production Database Seeding...');
  await dataSource.initialize();
  await dataSource.synchronize();

  const hospitalRepo = dataSource.getRepository(Hospital);
  const branchRepo = dataSource.getRepository(HospitalBranch);
  const roleRepo = dataSource.getRepository(UserRole);

  // Clear existing domain data in proper dependency order
  console.log('🧹 Truncating existing tables...');
  const tables = [
    'audit_logs',
    'payments',
    'invoice_items',
    'invoices',
    'admissions',
    'beds',
    'wards',
    'prescription_items',
    'prescriptions',
    'medical_notes',
    'encounters',
    'appointments',
    'slots',
    'doctor_schedules',
    'doctor_departments',
    'staff_profiles',
    'departments',
    'doctor_profiles',
    'patient_profiles',
    'user_roles',
    'hospital_branches',
    'hospitals',
  ];
  for (const table of tables) {
    try {
      await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
    } catch {
      // Ignore if table doesn't exist yet on clean start
    }
  }

  // 1. Seed Hospital & Main Branch
  console.log('🏥 Seeding Primary Hospital & Main Branch...');
  const h1 = await hospitalRepo.save(
    hospitalRepo.create({
      id: '11111111-0000-0000-0000-000000000001',
      code: 'HOSP-PULSE-001',
      name: 'PulseCare Medical Center',
      licenseNumber: 'LIC-MED-2026-9981',
      contactEmail: 'admin@pulsecare.com',
      contactPhone: '+1 (555) 234-5678',
      address: {
        street: '100 Healthcare Ave',
        city: 'Metropolis',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
      status: 'ACTIVE',
      settings: { timezone: 'America/New_York', currency: 'USD', emergencySupport: true },
    }),
  );

  await branchRepo.save(
    branchRepo.create({
      id: '10000000-0000-0000-0000-000000000001',
      hospitalId: h1.id,
      branchCode: 'CGH-MAIN',
      name: 'Downtown Main Campus',
      address: { street: '100 Healthcare Ave Building A', city: 'Metropolis' },
      contactPhone: '+1 (555) 234-5678',
      isMain: true,
    }),
  );

  // 2. Assign Admin User Role
  console.log('👤 Assigning Admin User Role...');
  await roleRepo.save(
    roleRepo.create({
      userId: '00000000-0000-0000-0000-000000000001',
      hospitalId: h1.id,
      role: 'ADMIN',
    }),
  );

  console.log(
    '✅ Clean Production Database Seeding Complete! Only single Admin user configured.',
  );
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
