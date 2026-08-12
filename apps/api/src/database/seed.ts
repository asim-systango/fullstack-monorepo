import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Hospital } from '../modules/hospital/entities/hospital.entity';
import { HospitalBranch } from '../modules/hospital/entities/hospital-branch.entity';
import { UserRole } from '../modules/auth/entities/user-role.entity';
import { PatientProfile } from '../modules/patient/entities/patient-profile.entity';
import { Department } from '../modules/organization/entities/department.entity';
import { StaffProfile } from '../modules/organization/entities/staff-profile.entity';
import { DoctorProfile } from '../modules/doctor/entities/doctor-profile.entity';
import { DoctorDepartment } from '../modules/doctor/entities/doctor-department.entity';
import { DoctorSchedule } from '../modules/doctor/entities/doctor-schedule.entity';
import { Slot } from '../modules/slot/entities/slot.entity';
import { Appointment } from '../modules/appointment/entities/appointment.entity';
import { Encounter } from '../modules/ehr/entities/encounter.entity';
import { MedicalNote } from '../modules/medical-note/entities/medical-note.entity';
import { Prescription } from '../modules/prescription/entities/prescription.entity';
import { PrescriptionItem } from '../modules/prescription/entities/prescription-item.entity';
import { Ward } from '../modules/ipd/entities/ward.entity';
import { Bed } from '../modules/ipd/entities/bed.entity';
import { Admission } from '../modules/ipd/entities/admission.entity';
import { Invoice } from '../modules/billing/entities/invoice.entity';
import { InvoiceItem } from '../modules/billing/entities/invoice-item.entity';
import { Payment } from '../modules/billing/entities/payment.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { SlotStatus } from '../shared/enums/slot-status.enum';
import { AppointmentStatus } from '../shared/enums/appointment-status.enum';

async function seed() {
  console.log('🌱 Starting Enterprise Multi-Hospital Database Seeding...');
  await dataSource.initialize();
  await dataSource.synchronize();

  const hospitalRepo = dataSource.getRepository(Hospital);
  const branchRepo = dataSource.getRepository(HospitalBranch);
  const roleRepo = dataSource.getRepository(UserRole);
  const patientRepo = dataSource.getRepository(PatientProfile);
  const deptRepo = dataSource.getRepository(Department);
  const staffRepo = dataSource.getRepository(StaffProfile);
  const doctorRepo = dataSource.getRepository(DoctorProfile);
  const docDeptRepo = dataSource.getRepository(DoctorDepartment);
  const scheduleRepo = dataSource.getRepository(DoctorSchedule);
  const slotRepo = dataSource.getRepository(Slot);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const encounterRepo = dataSource.getRepository(Encounter);
  const noteRepo = dataSource.getRepository(MedicalNote);
  const prescriptionRepo = dataSource.getRepository(Prescription);
  const itemRepo = dataSource.getRepository(PrescriptionItem);
  const wardRepo = dataSource.getRepository(Ward);
  const bedRepo = dataSource.getRepository(Bed);
  const admissionRepo = dataSource.getRepository(Admission);
  const invoiceRepo = dataSource.getRepository(Invoice);
  const invoiceItemRepo = dataSource.getRepository(InvoiceItem);
  const paymentRepo = dataSource.getRepository(Payment);
  const auditRepo = dataSource.getRepository(AuditLog);

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

  // 1. Seed Hospitals
  console.log('🏥 Seeding Hospitals & Branches...');
  const h1 = await hospitalRepo.save(
    hospitalRepo.create({
      id: '11111111-0000-0000-0000-000000000001',
      code: 'HOSP-CGH-001',
      name: 'City General Medical Center',
      licenseNumber: 'LIC-MED-2026-9981',
      contactEmail: 'admin@citygeneral.health',
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

  await hospitalRepo.save(
    hospitalRepo.create({
      id: '22222222-0000-0000-0000-000000000002',
      code: 'HOSP-STJ-002',
      name: 'St. Jude Specialty Hospital',
      licenseNumber: 'LIC-MED-2026-4420',
      contactEmail: 'contact@stjude-health.org',
      contactPhone: '+1 (555) 876-5432',
      address: {
        street: '450 Mercy Way',
        city: 'Metropolis',
        state: 'NY',
        zip: '10002',
        country: 'USA',
      },
      status: 'ACTIVE',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        emergencySupport: false,
      },
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

  await branchRepo.save(
    branchRepo.create({
      id: '20000000-0000-0000-0000-000000000002',
      hospitalId: h1.id,
      branchCode: 'CGH-WEST',
      name: 'Westside Medical Pavilion',
      address: { street: '78 Westside Blvd', city: 'Metropolis' },
      contactPhone: '+1 (555) 234-9900',
      isMain: false,
    }),
  );

  // 2. Seed Departments
  console.log('🏛️ Seeding Clinical Departments...');
  const dCardio = await deptRepo.save(
    deptRepo.create({
      id: '30000000-0000-0000-0000-000000000001',
      hospitalId: h1.id,
      code: 'CARDIO',
      name: 'Cardiovascular Sciences',
      locationFloor: '3rd Floor Wing B',
    }),
  );

  const dDermat = await deptRepo.save(
    deptRepo.create({
      id: '30000000-0000-0000-0000-000000000002',
      hospitalId: h1.id,
      code: 'DERMAT',
      name: 'Dermatology & Cutaneous Surgery',
      locationFloor: '2nd Floor Wing A',
    }),
  );

  const dOrtho = await deptRepo.save(
    deptRepo.create({
      id: '30000000-0000-0000-0000-000000000003',
      hospitalId: h1.id,
      code: 'ORTHO',
      name: 'Orthopedic Surgery & Traumatology',
      locationFloor: '4th Floor Wing C',
    }),
  );

  // 3. Seed Doctors
  console.log('🩺 Seeding Doctors & Department Affiliations...');
  const doc1 = await doctorRepo.save(
    doctorRepo.create({
      id: 'd1111111-1111-1111-1111-111111111111',
      userId: '11111111-1111-1111-1111-111111111111',
      hospitalId: h1.id,
      medicalLicense: 'MED-NY-448102',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      specialization: 'Cardiology',
      qualification: 'MD, FACC (Cardiology)',
      experienceYears: 14,
      consultationFee: 750.0,
      biography:
        'Senior Interventional Cardiologist specializing in preventive heart health and complex coronary interventions.',
      profileImage:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
      isActive: true,
    }),
  );

  const doc2 = await doctorRepo.save(
    doctorRepo.create({
      id: 'd2222222-2222-2222-2222-222222222222',
      userId: '22222222-2222-2222-2222-222222222222',
      hospitalId: h1.id,
      medicalLicense: 'MED-NY-889104',
      firstName: 'Priya',
      lastName: 'Deshmukh',
      specialization: 'Dermatology',
      qualification: 'MD, DNB (Dermatology)',
      experienceYears: 9,
      consultationFee: 600.0,
      biography:
        'Consultant Dermatologist and Trichologist with clinical expertise in cosmetic skin therapies and pediatric dermatology.',
      profileImage:
        'https://images.unsplash.com/photo-1594824813566-88855ce78965?w=400&q=80',
      isActive: true,
    }),
  );

  const doc3 = await doctorRepo.save(
    doctorRepo.create({
      id: 'd3333333-3333-3333-3333-333333333333',
      userId: '33333333-3333-3333-3333-333333333333',
      hospitalId: h1.id,
      medicalLicense: 'MED-NY-112948',
      firstName: 'Arjun',
      lastName: 'Mehta',
      specialization: 'Orthopedics',
      qualification: 'MS (Orthopedics), MCh',
      experienceYears: 12,
      consultationFee: 800.0,
      biography:
        'Orthopedic Surgeon specializing in joint replacement, sports injury rehabilitation, and arthroscopic procedures.',
      profileImage:
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
      isActive: true,
    }),
  );

  await docDeptRepo.save([
    docDeptRepo.create({ doctorId: doc1.id, departmentId: dCardio.id, isPrimary: true }),
    docDeptRepo.create({ doctorId: doc2.id, departmentId: dDermat.id, isPrimary: true }),
    docDeptRepo.create({ doctorId: doc3.id, departmentId: dOrtho.id, isPrimary: true }),
  ]);

  // 4. Seed Patients & Roles
  console.log('👤 Seeding Patients & User RBAC Roles...');
  const patUser1 = '44444444-4444-4444-4444-444444444444';
  const patUser2 = '55555555-5555-5555-5555-555555555555';

  const pat1 = await patientRepo.save(
    patientRepo.create({
      id: '40000000-0000-0000-0000-000000000001',
      userId: patUser1,
      hospitalId: h1.id,
      mrn: 'MRN-2026-000101',
      dateOfBirth: '1988-04-12',
      gender: 'MALE',
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Sarah Doe',
        relation: 'Spouse',
        phone: '+1 (555) 019-2831',
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        chronicConditions: ['Mild Hypertension'],
        pastSurgeries: [],
      },
    }),
  );

  await patientRepo.save(
    patientRepo.create({
      id: '40000000-0000-0000-0000-000000000002',
      userId: patUser2,
      hospitalId: h1.id,
      mrn: 'MRN-2026-000102',
      dateOfBirth: '1992-09-25',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      emergencyContact: {
        name: 'Michael Smith',
        relation: 'Father',
        phone: '+1 (555) 018-7712',
      },
      medicalHistory: {
        allergies: [],
        chronicConditions: ['Asthma'],
        pastSurgeries: ['Appendectomy 2018'],
      },
    }),
  );

  await roleRepo.save([
    roleRepo.create({
      userId: '00000000-0000-0000-0000-000000000000',
      hospitalId: null,
      role: 'SUPER_ADMIN',
    }),
    roleRepo.create({ userId: doc1.userId, hospitalId: h1.id, role: 'DOCTOR' }),
    roleRepo.create({ userId: doc2.userId, hospitalId: h1.id, role: 'DOCTOR' }),
    roleRepo.create({ userId: patUser1, hospitalId: h1.id, role: 'PATIENT' }),
    roleRepo.create({ userId: patUser2, hospitalId: h1.id, role: 'PATIENT' }),
  ]);

  // 5. Seed Staff
  console.log('👩‍⚕️ Seeding Hospital Staff...');
  await staffRepo.save([
    staffRepo.create({
      userId: '66666666-6666-6666-6666-666666666661',
      hospitalId: h1.id,
      departmentId: dCardio.id,
      staffType: 'NURSE',
      shiftSchedule: 'DAY_SHIFT (07:00 - 15:30)',
    }),
    staffRepo.create({
      userId: '66666666-6666-6666-6666-666666666662',
      hospitalId: h1.id,
      departmentId: dDermat.id,
      staffType: 'RECEPTIONIST',
      shiftSchedule: 'GENERAL_SHIFT (09:00 - 17:30)',
    }),
  ]);

  // 6. Seed Doctor Schedules & Slots
  console.log('⏰ Seeding Doctor Schedules & 20 Slots...');
  await scheduleRepo.save([
    scheduleRepo.create({
      doctorId: doc1.id,
      dayOfWeek: 1,
      startTime: '09:00:00',
      endTime: '17:00:00',
      slotDurationMins: 30,
    }),
    scheduleRepo.create({
      doctorId: doc2.id,
      dayOfWeek: 2,
      startTime: '10:00:00',
      endTime: '16:00:00',
      slotDurationMins: 30,
    }),
  ]);

  const now = new Date();
  const baseTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    9,
    0,
    0,
  );

  const slotData = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      doctorId: doc1.id,
      offsetHours: 0,
      status: SlotStatus.BOOKED,
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      doctorId: doc1.id,
      offsetHours: 1,
      status: SlotStatus.BOOKED,
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      doctorId: doc1.id,
      offsetHours: 2,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      doctorId: doc1.id,
      offsetHours: 3,
      status: SlotStatus.BLOCKED,
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      doctorId: doc1.id,
      offsetHours: 4,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      doctorId: doc1.id,
      offsetHours: 5,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000001',
      doctorId: doc2.id,
      offsetHours: 0,
      status: SlotStatus.BOOKED,
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      doctorId: doc2.id,
      offsetHours: 1,
      status: SlotStatus.BOOKED,
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      doctorId: doc2.id,
      offsetHours: 2,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      doctorId: doc2.id,
      offsetHours: 3,
      status: SlotStatus.BLOCKED,
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      doctorId: doc2.id,
      offsetHours: 4,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000006',
      doctorId: doc2.id,
      offsetHours: 5,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000007',
      doctorId: doc2.id,
      offsetHours: 6,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000001',
      doctorId: doc3.id,
      offsetHours: 0,
      status: SlotStatus.BOOKED,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      doctorId: doc3.id,
      offsetHours: 1,
      status: SlotStatus.BOOKED,
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      doctorId: doc3.id,
      offsetHours: 2,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000004',
      doctorId: doc3.id,
      offsetHours: 3,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000005',
      doctorId: doc3.id,
      offsetHours: 4,
      status: SlotStatus.BLOCKED,
    },
    {
      id: '30000000-0000-0000-0000-000000000006',
      doctorId: doc3.id,
      offsetHours: 5,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000007',
      doctorId: doc3.id,
      offsetHours: 6,
      status: SlotStatus.AVAILABLE,
    },
  ];

  const slots: Slot[] = [];
  for (const s of slotData) {
    const startsAt = new Date(baseTime.getTime() + s.offsetHours * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
    const slot = await slotRepo.save(
      slotRepo.create({
        id: s.id,
        hospitalId: h1.id,
        doctorId: s.doctorId,
        startsAt,
        endsAt,
        status: s.status,
      }),
    );
    slots.push(slot);
  }

  // 7. Seed Appointments
  console.log('📅 Seeding OPD Appointments...');
  const a1 = await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a1111111-1111-1111-1111-111111111111',
      hospitalId: h1.id,
      patientId: patUser1,
      slotId: slots[0]!.id,
      type: 'IN_PERSON',
      status: AppointmentStatus.COMPLETED,
      reason: 'Routine cardiac consultation & lipid profile review',
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a2222222-2222-2222-2222-222222222222',
      hospitalId: h1.id,
      patientId: patUser2,
      slotId: slots[1]!.id,
      type: 'IN_PERSON',
      status: AppointmentStatus.SCHEDULED,
      reason: 'Chest discomfort on exertion follow-up',
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a3333333-3333-3333-3333-333333333333',
      hospitalId: h1.id,
      patientId: patUser1,
      slotId: slots[6]!.id,
      type: 'IN_PERSON',
      status: AppointmentStatus.COMPLETED,
      reason: 'Skin flare-up consultation and allergy check',
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a4444444-4444-4444-4444-444444444444',
      hospitalId: h1.id,
      patientId: patUser2,
      slotId: slots[7]!.id,
      type: 'IN_PERSON',
      status: AppointmentStatus.SCHEDULED,
      reason: 'Eczema management consultation',
    }),
  );

  // 8. Seed Encounters, Notes & Prescriptions
  console.log('📋 Seeding EHR Encounters, SOAP Notes & Prescriptions...');
  const e1 = await encounterRepo.save(
    encounterRepo.create({
      hospitalId: h1.id,
      patientId: pat1.id,
      attendingDoctorId: doc1.id,
      appointmentId: a1.id,
      type: 'OPD',
      startTime: new Date(),
      status: 'FINISHED',
    }),
  );

  await noteRepo.save([
    noteRepo.create({
      encounterId: e1.id,
      appointmentId: a1.id,
      doctorId: doc1.id,
      notes: 'Patient reports mild dyspnea on stair climbing. BP 128/82 mmHg.',
      subjective: 'Mild exertional dyspnea for 2 weeks.',
      objective: 'BP 128/82, HR 72 bpm regular. S1 S2 normal.',
      assessment: 'Essential hypertension & mild dyspnea.',
      plan: 'Start Atorvastatin 20mg and Aspirin 75mg daily.',
    }),
    noteRepo.create({
      appointmentId: 'a3333333-3333-3333-3333-333333333333',
      doctorId: doc2.id,
      notes: 'Erythematous rash observed on forearm.',
      subjective: 'Pruritic lesion on left forearm.',
      objective: 'Erythematous plaque with mild scaling.',
      assessment: 'Contact Dermatitis.',
      plan: 'Hydrocortisone cream 1% topical BD for 7 days.',
    }),
  ]);

  const p1 = await prescriptionRepo.save(
    prescriptionRepo.create({
      id: 'fa111111-1111-1111-1111-111111111111',
      encounterId: e1.id,
      appointmentId: a1.id,
      diagnosis: 'Hypertension & Hyperlipidemia',
      medicines: [
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily after dinner',
          duration: '30 days',
        },
        {
          name: 'Aspirin',
          dosage: '75mg',
          frequency: 'Once daily after breakfast',
          duration: '30 days',
        },
      ],
      instructions: 'Maintain low sodium diet and repeat lipid panel in 4 weeks.',
      validUntil: '2026-09-15',
    }),
  );

  await itemRepo.save([
    itemRepo.create({
      prescriptionId: p1.id,
      medicineName: 'Atorvastatin',
      dosage: '20mg',
      frequency: '1-0-0',
      durationDays: 30,
      route: 'ORAL',
    }),
    itemRepo.create({
      prescriptionId: p1.id,
      medicineName: 'Aspirin',
      dosage: '75mg',
      frequency: '0-1-0',
      durationDays: 30,
      route: 'ORAL',
    }),
  ]);

  // 9. Seed IPD Wards, Beds & Admissions
  console.log('🛏️ Seeding IPD Wards, Beds & Patient Admissions...');
  const w1 = await wardRepo.save(
    wardRepo.create({
      hospitalId: h1.id,
      branchId: '10000000-0000-0000-0000-000000000001',
      name: 'Cardiovascular ICU Unit A',
      type: 'ICU',
      dailyRate: 1500.0,
    }),
  );

  const bed1 = await bedRepo.save(
    bedRepo.create({ wardId: w1.id, bedNumber: 'ICU-101', status: 'OCCUPIED' }),
  );
  await bedRepo.save(
    bedRepo.create({ wardId: w1.id, bedNumber: 'ICU-102', status: 'AVAILABLE' }),
  );

  await admissionRepo.save(
    admissionRepo.create({
      hospitalId: h1.id,
      patientId: pat1.id,
      bedId: bed1.id,
      admittingDoctorId: doc1.id,
      admittedAt: new Date(),
      status: 'ADMITTED',
    }),
  );

  // 10. Seed Invoices & Payments
  console.log('💳 Seeding Billing Invoices & Payments...');
  const inv1 = await invoiceRepo.save(
    invoiceRepo.create({
      hospitalId: h1.id,
      patientId: pat1.id,
      encounterId: e1.id,
      invoiceNumber: 'INV-2026-00891',
      subtotal: 750.0,
      taxAmount: 37.5,
      discountAmount: 0.0,
      totalAmount: 787.5,
      paidAmount: 787.5,
      paymentStatus: 'PAID',
    }),
  );

  await invoiceItemRepo.save([
    invoiceItemRepo.create({
      invoiceId: inv1.id,
      itemType: 'CONSULTATION',
      description: 'Cardiology Specialist Consultation',
      quantity: 1,
      unitPrice: 750.0,
      totalPrice: 750.0,
    }),
  ]);

  await paymentRepo.save(
    paymentRepo.create({
      invoiceId: inv1.id,
      paymentMethod: 'STRIPE',
      transactionRef: 'ch_3M0000000000000000000001',
      amount: 787.5,
      status: 'SUCCESS',
    }),
  );

  // 11. Seed Audit Logs
  console.log('🔒 Seeding Security Audit Logs...');
  const loopbackIp = '127.0.0.1';
  await auditRepo.save([
    auditRepo.create({
      hospitalId: h1.id,
      actorId: doc1.userId,
      actorRole: 'DOCTOR',
      action: 'CREATE_APPOINTMENT',
      entityName: 'appointments',
      entityId: a1.id,
      ipAddress: loopbackIp,
      changesBefore: null,
      changesAfter: { appointmentId: a1.id, status: 'COMPLETED' },
    }),
    auditRepo.create({
      hospitalId: h1.id,
      actorId: patUser1,
      actorRole: 'PATIENT',
      action: 'READ_EHR',
      entityName: 'prescriptions',
      entityId: p1.id,
      ipAddress: loopbackIp,
      changesBefore: null,
      changesAfter: { view: 'PATIENT_PORTAL' },
    }),
  ]);

  console.log(
    '✅ Enterprise Multi-Hospital Database Seeding Complete across all 19 Entities!',
  );
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
