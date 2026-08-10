# Day 2 Subtask Checklist — Database Modeling & Domain Foundation

## Legend

- [ ] Pending
- [x] Completed

---

## 1. Backend Domain & Database Tasks (`apps/api`)

### Entities & Database Schema (`apps/api/src/modules/*/entities/`)

- [x] Task 1.1: Verify `DoctorProfile` entity (`apps/api/src/modules/doctor/entities/doctor-profile.entity.ts`) with UUID primary key, `userId` unique index, `specialization` index, timestamps, and soft delete (`deletedAt`).
- [x] Task 1.2: Verify `Slot` entity (`apps/api/src/modules/slot/entities/slot.entity.ts`) with UUID primary key, `doctorId` FK & index, `startsAt` index, `status` enum index, and `startsAt < endsAt` check constraint.
- [x] Task 1.3: Verify `Appointment` entity (`apps/api/src/modules/appointment/entities/appointment.entity.ts`) with UUID primary key, `patientId` index, `slotId` unique FK, `status` enum index, timestamps, and soft delete (`deletedAt`).
- [x] Task 1.4: Verify `Prescription` entity (`apps/api/src/modules/prescription/entities/prescription.entity.ts`) with UUID primary key, `appointmentId` unique FK, `medicines`, `instructions`, and timestamps.
- [x] Task 1.5: Verify `MedicalNote` entity (`apps/api/src/modules/medical-note/entities/medical-note.entity.ts`) with UUID primary key, `appointmentId` FK, `doctorId` FK, `notes`, and timestamp.

### Repositories Layer (`apps/api/src/modules/*/repositories/`)

- [x] Task 1.6: Implement `DoctorRepository` in `apps/api/src/modules/doctor/repositories/doctor.repository.ts`.
- [x] Task 1.7: Implement `SlotRepository` in `apps/api/src/modules/slot/repositories/slot.repository.ts`.
- [x] Task 1.8: Implement `AppointmentRepository` in `apps/api/src/modules/appointment/repositories/appointment.repository.ts`.
- [x] Task 1.9: Implement `PrescriptionRepository` in `apps/api/src/modules/prescription/repositories/prescription.repository.ts`.
- [x] Task 1.10: Implement `MedicalNoteRepository` in `apps/api/src/modules/medical-note/repositories/medical-note.repository.ts`.

### DTOs & Validation Pipes (`apps/api/src/modules/*/dto/`)

- [x] Task 1.11: Review & enforce class-validator DTOs for Doctor (`CreateDoctorDto`, `UpdateDoctorDto`).
- [x] Task 1.12: Review & enforce class-validator DTOs for Slot (`CreateSlotDto`, `UpdateSlotDto`).
- [x] Task 1.13: Review & enforce class-validator DTOs for Appointment (`CreateAppointmentDto`, `UpdateAppointmentDto`).
- [x] Task 1.14: Review & enforce class-validator DTOs for Prescription (`CreatePrescriptionDto`, `UpdatePrescriptionDto`).
- [x] Task 1.15: Review & enforce class-validator DTOs for MedicalNote (`CreateMedicalNoteDto`, `UpdateMedicalNoteDto`).

### Services & Controllers (`apps/api/src/modules/*`)

- [x] Task 1.16: Wire custom repositories into `DoctorService` & update `DoctorController` with full Swagger annotations and standard response envelope.
- [x] Task 1.17: Wire custom repositories into `SlotService` & update `SlotController` with full Swagger annotations and standard response envelope.
- [x] Task 1.18: Wire custom repositories into `AppointmentService` & update `AppointmentController` with full Swagger annotations and standard response envelope.
- [x] Task 1.19: Wire custom repositories into `PrescriptionService` & update `PrescriptionController` with full Swagger annotations and standard response envelope.
- [x] Task 1.20: Wire custom repositories into `MedicalNoteService` & update `MedicalNoteController` with full Swagger annotations and standard response envelope.

### Database Migrations & Seeding (`apps/api/src/database/`)

- [x] Task 1.21: Run migration generation (`pnpm migration:generate`) to ensure domain tables (`doctor_profiles`, `slots`, `appointments`, `prescriptions`, `medical_notes`) align with TypeORM entities.
- [x] Task 1.22: Implement comprehensive seed script in `apps/api/src/database/seed.ts` inserting 3 Doctors, 12 Slots, 4 Appointments, 2 Prescriptions, and 5 Medical Notes with realistic timestamps.

---

## 2. Frontend Mock Pages & Component Architecture (`apps/web`)

### Domain Types & API Services (`apps/web/features/*`)

- [x] Task 2.1: Implement TypeScript interfaces (`Doctor`, `Slot`, `Appointment`, `Prescription`, `MedicalNote`) in `apps/web/features/*/types`.
- [x] Task 2.2: Implement API service modules with typed CRUD requests in `apps/web/features/*/services`.
- [x] Task 2.3: Implement TanStack Query hooks (`useDoctors`, `useDoctor`, `useSlots`, `useAppointments`) in `apps/web/features/*/hooks`.

### UI Components (`apps/web/components/*` & `apps/web/features/*`)

- [x] Task 2.4: Implement reusable `DoctorCard` and `DoctorTable` components using `@shared/ui/components` and semantic tokens.
- [x] Task 2.5: Implement reusable `SlotCard` component with slot status badges (`AVAILABLE`, `BOOKED`, `BLOCKED`).
- [x] Task 2.6: Implement reusable `AppointmentCard` component with patient/doctor metadata and status badges.
- [x] Task 2.7: Ensure `EmptyState`, `LoadingSkeleton`, and `ErrorState` components are fully utilized across all feature views.

### Dashboard Pages (`apps/web/app/(dashboard)/*`)

- [x] Task 2.8: Build `/doctors` listing page with specialization and status filtering controls.
- [x] Task 2.9: Build `/doctor/[id]` detail page rendering doctor biography, qualifications, and available consultation slot schedule.
- [x] Task 2.10: Build `/appointments` overview page with tabbed status filtering (`All`, `Scheduled`, `Completed`, `Cancelled`).

---

## 3. Documentation Updates (`docs/docs/`)

- [x] Task 3.1: Update `docs/docs/ERD.md` with complete Mermaid database diagram.
- [x] Task 3.2: Update `docs/docs/DATABASE_DESIGN.md` with table specs, indexing strategy, and repository layer details.
- [x] Task 3.3: Update `docs/docs/API_CONTRACT.md` with full REST endpoint specifications and request/response examples.

---

## 4. Verification & Final Check

- [x] Task 4.1: Execute workspace type check: `pnpm typecheck` (0 errors).
- [x] Task 4.2: Execute workspace linting: `pnpm lint` (0 errors).
- [x] Task 4.3: Verify database migrations and seed execution (`pnpm migration:run:api` & `pnpm seed`).
