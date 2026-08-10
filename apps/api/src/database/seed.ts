import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { DoctorProfile } from '../modules/doctor/entities/doctor-profile.entity';
import { Slot } from '../modules/slot/entities/slot.entity';
import { Appointment } from '../modules/appointment/entities/appointment.entity';
import { Prescription } from '../modules/prescription/entities/prescription.entity';
import { MedicalNote } from '../modules/medical-note/entities/medical-note.entity';
import { SlotStatus } from '../shared/enums/slot-status.enum';
import { AppointmentStatus } from '../shared/enums/appointment-status.enum';

async function seed() {
  console.log('🌱 Starting Database Seeding...');
  await dataSource.initialize();

  const doctorRepo = dataSource.getRepository(DoctorProfile);
  const slotRepo = dataSource.getRepository(Slot);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const prescriptionRepo = dataSource.getRepository(Prescription);
  const noteRepo = dataSource.getRepository(MedicalNote);

  // Clear existing domain data in correct order
  console.log('🧹 Cleaning existing domain records...');
  await noteRepo.query('TRUNCATE TABLE medical_notes CASCADE');
  await prescriptionRepo.query('TRUNCATE TABLE prescriptions CASCADE');
  await appointmentRepo.query('TRUNCATE TABLE appointments CASCADE');
  await slotRepo.query('TRUNCATE TABLE slots CASCADE');
  await doctorRepo.query('TRUNCATE TABLE doctor_profiles CASCADE');

  // 1. Seed 3 Doctors
  console.log('🩺 Seeding Doctors...');
  const d1 = await doctorRepo.save(
    doctorRepo.create({
      id: 'd1111111-1111-1111-1111-111111111111',
      userId: '11111111-1111-1111-1111-111111111111',
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

  const d2 = await doctorRepo.save(
    doctorRepo.create({
      id: 'd2222222-2222-2222-2222-222222222222',
      userId: '22222222-2222-2222-2222-222222222222',
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

  const d3 = await doctorRepo.save(
    doctorRepo.create({
      id: 'd3333333-3333-3333-3333-333333333333',
      userId: '33333333-3333-3333-3333-333333333333',
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

  const now = new Date();
  const baseTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    9,
    0,
    0,
  );

  // 2. Seed 20 Slots (mixed status)
  console.log('⏰ Seeding 20 Consultation Slots...');
  const slotData = [
    // Doctor 1 Slots (6 slots)
    {
      id: '10000000-0000-0000-0000-000000000001',
      doctorId: d1.id,
      offsetHours: 0,
      status: SlotStatus.BOOKED,
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      doctorId: d1.id,
      offsetHours: 1,
      status: SlotStatus.BOOKED,
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      doctorId: d1.id,
      offsetHours: 2,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      doctorId: d1.id,
      offsetHours: 3,
      status: SlotStatus.BLOCKED,
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      doctorId: d1.id,
      offsetHours: 4,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      doctorId: d1.id,
      offsetHours: 5,
      status: SlotStatus.AVAILABLE,
    },
    // Doctor 2 Slots (7 slots)
    {
      id: '20000000-0000-0000-0000-000000000001',
      doctorId: d2.id,
      offsetHours: 0,
      status: SlotStatus.BOOKED,
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      doctorId: d2.id,
      offsetHours: 1,
      status: SlotStatus.BOOKED,
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      doctorId: d2.id,
      offsetHours: 2,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      doctorId: d2.id,
      offsetHours: 3,
      status: SlotStatus.BLOCKED,
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      doctorId: d2.id,
      offsetHours: 4,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000006',
      doctorId: d2.id,
      offsetHours: 5,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '20000000-0000-0000-0000-000000000007',
      doctorId: d2.id,
      offsetHours: 6,
      status: SlotStatus.AVAILABLE,
    },
    // Doctor 3 Slots (7 slots)
    {
      id: '30000000-0000-0000-0000-000000000001',
      doctorId: d3.id,
      offsetHours: 0,
      status: SlotStatus.BOOKED,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      doctorId: d3.id,
      offsetHours: 1,
      status: SlotStatus.BOOKED,
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      doctorId: d3.id,
      offsetHours: 2,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000004',
      doctorId: d3.id,
      offsetHours: 3,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000005',
      doctorId: d3.id,
      offsetHours: 4,
      status: SlotStatus.BLOCKED,
    },
    {
      id: '30000000-0000-0000-0000-000000000006',
      doctorId: d3.id,
      offsetHours: 5,
      status: SlotStatus.AVAILABLE,
    },
    {
      id: '30000000-0000-0000-0000-000000000007',
      doctorId: d3.id,
      offsetHours: 6,
      status: SlotStatus.AVAILABLE,
    },
  ];

  const slots: Slot[] = [];
  for (const s of slotData) {
    const startsAt = new Date(baseTime.getTime() + s.offsetHours * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
    const createdSlot = await slotRepo.save(
      slotRepo.create({
        id: s.id,
        doctorId: s.doctorId,
        startsAt,
        endsAt,
        status: s.status,
      }),
    );
    slots.push(createdSlot);
  }

  // 3. Seed 6 Appointments
  console.log('📅 Seeding 6 Appointments...');
  const patient1 = '44444444-4444-4444-4444-444444444444';
  const patient2 = '55555555-5555-5555-5555-555555555555';

  const a1 = await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a1111111-1111-1111-1111-111111111111',
      patientId: patient1,
      slotId: slots[0]!.id,
      status: AppointmentStatus.COMPLETED,
      reason: 'Routine cardiac consultation & lipid profile review',
    }),
  );

  const a2 = await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a2222222-2222-2222-2222-222222222222',
      patientId: patient2,
      slotId: slots[1]!.id,
      status: AppointmentStatus.SCHEDULED,
      reason: 'Chest discomfort on exertion follow-up',
    }),
  );

  const a3 = await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a3333333-3333-3333-3333-333333333333',
      patientId: patient1,
      slotId: slots[6]!.id,
      status: AppointmentStatus.COMPLETED,
      reason: 'Skin flare-up consultation and allergy check',
    }),
  );

  const a4 = await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a4444444-4444-4444-4444-444444444444',
      patientId: patient2,
      slotId: slots[7]!.id,
      status: AppointmentStatus.SCHEDULED,
      reason: 'Eczema management consultation',
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a5555555-5555-5555-5555-555555555555',
      patientId: patient1,
      slotId: slots[13]!.id,
      status: AppointmentStatus.SCHEDULED,
      reason: 'Knee joint pain & mobility check',
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      id: 'a6666666-6666-6666-6666-666666666666',
      patientId: patient2,
      slotId: slots[14]!.id,
      status: AppointmentStatus.CANCELLED,
      reason: 'Orthopedic consultation (cancelled by patient)',
    }),
  );

  // 4. Seed 2 Prescriptions
  console.log('💊 Seeding 2 Prescriptions...');
  await prescriptionRepo.save(
    prescriptionRepo.create({
      id: 'fa111111-1111-1111-1111-111111111111',
      appointmentId: a1.id,
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
      instructions:
        'Maintain low sodium diet. Avoid strenuous exercise until lipid repeat test.',
    }),
  );

  await prescriptionRepo.save(
    prescriptionRepo.create({
      id: 'fa222222-2222-2222-2222-222222222222',
      appointmentId: a3.id,
      medicines: [
        {
          name: 'Desloratadine',
          dosage: '5mg',
          frequency: 'Once daily morning',
          duration: '14 days',
        },
        {
          name: 'Hydrocortisone 1% Cream',
          dosage: 'Topical',
          frequency: 'Apply twice daily',
          duration: '7 days',
        },
      ],
      instructions: 'Keep affected area dry. Avoid harsh soaps or scented creams.',
    }),
  );

  // 5. Seed 5 Medical Notes
  console.log('📝 Seeding 5 Medical Notes...');
  await noteRepo.save([
    noteRepo.create({
      appointmentId: a1.id,
      doctorId: d1.id,
      notes:
        'Patient reports mild dyspnea on stair climbing. BP 128/82 mmHg. Pulse 72 bpm regular.',
    }),
    noteRepo.create({
      appointmentId: a1.id,
      doctorId: d1.id,
      notes:
        'ECG shows normal sinus rhythm. Advised 2D Echocardiogram if symptoms persist.',
    }),
    noteRepo.create({
      appointmentId: a2.id,
      doctorId: d1.id,
      notes: 'Patient pre-booked slot. Initial medical history form submitted.',
    }),
    noteRepo.create({
      appointmentId: a3.id,
      doctorId: d2.id,
      notes: 'Erythematous rash observed on forearm. Suspected contact dermatitis.',
    }),
    noteRepo.create({
      appointmentId: a4.id,
      doctorId: d3.id,
      notes:
        'Cancellation requested via patient portal. Slot released back to available pool.',
    }),
  ]);

  console.log('✅ Database Seeding Successfully Completed!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
