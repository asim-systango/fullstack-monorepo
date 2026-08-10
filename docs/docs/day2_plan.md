# Day 2 Implementation Plan — Database Modeling & Domain Foundation

## Overview & Objective

Day 1 is 100% complete with project foundation, monorepo architecture, Docker setup, layout components, and initial documentation.
The goal for **Day 2** is to establish the complete database modeling and domain CRUD foundation for the **Hospital Appointment System** across backend (`apps/api`), frontend (`apps/web`), and project documentation (`docs/docs`).

---

## Architectural & Coding Rules (Derived from `/docs`)

1. **Domain Isolation**: Backend domain CRUD in `apps/api` (`@app/api`). Next.js UI in `apps/web` (`@app/web`).
2. **Database Migrations**: No `synchronize: true`. All schema changes must be applied via TypeORM migrations in `apps/api/src/database/migrations`.
3. **Repository Pattern**: Explicit Repository layer (`*Repository`) extending or wrapping TypeORM `Repository<Entity>` to isolate DB operations from business logic/validation.
4. **Validation & DTOs**: Strict class-validator and class-transformer validation pipes across all Nest endpoints.
5. **Swagger OpenAPI**: Complete annotations (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`) on all endpoints and DTOs.
6. **Standard Response Envelope**: Consistent `{ success: boolean, message: string, data?: any, errors?: any[] }` envelope via shared HTTP interceptor/filter.
7. **Frontend Design System**: Use `@shared/ui/components` (Button, Card, Table, EmptyState, LoadingState, Skeleton) and semantic theme tokens (`bg-background`, `text-primary`).
8. **UI States**: Explicit handling for Loading (`LoadingSkeleton` / `LoadingState`), Empty (`EmptyState`), and Error (`ErrorState` / `Alert`). No unhandled or empty UI states.
9. **Zero Shortcuts**: Fully typed code, zero `any`, zero remaining TODO placeholders.

---

## Phase 1: Backend Domain & Database Infrastructure (`apps/api`)

### 1. Entities & Relationships (`apps/api/src/modules/*/entities/`)

- `DoctorProfile` (`doctor_profiles`): `id` (UUID), `userId` (UUID, Unique), `firstName`, `lastName`, `specialization` (Indexed), `qualification`, `experienceYears`, `consultationFee`, `biography`, `profileImage`, `isActive`, timestamps, `deletedAt`. 1:1 with User, 1:N with Slot.
- `Slot` (`slots`): `id` (UUID), `doctorId` (UUID, Indexed FK), `startsAt` (Timestamptz, Indexed), `endsAt` (Timestamptz), `status` (`AVAILABLE` | `BOOKED` | `BLOCKED`, Indexed), timestamps. Check constraint: `startsAt < endsAt`.
- `Appointment` (`appointments`): `id` (UUID), `patientId` (UUID, Indexed), `slotId` (UUID, Unique FK), `status` (`SCHEDULED` | `CANCELLED` | `COMPLETED`, Indexed), `reason`, timestamps, `deletedAt`. 1:1 with Slot, 1:1 with Prescription, 1:N with MedicalNote.
- `Prescription` (`prescriptions`): `id` (UUID), `appointmentId` (UUID, Unique FK), `medicines` (JSON/Text), `instructions`, timestamps. 1:1 with Appointment.
- `MedicalNote` (`medical_notes`): `id` (UUID), `appointmentId` (UUID, FK), `doctorId` (UUID, FK), `notes`, timestamp. N:1 with Appointment, N:1 with DoctorProfile.

### 2. Custom Repositories (`apps/api/src/modules/*/repositories/`)

- `DoctorRepository`: Custom database queries for doctor profile lookups, soft-deletes, and filter queries.
- `SlotRepository`: Slot queries by doctor, date range, and availability status.
- `AppointmentRepository`: Appointment queries by patient, doctor, and status.
- `PrescriptionRepository`: Prescription persistence and appointment lookup.
- `MedicalNoteRepository`: Medical note persistence and appointment/doctor queries.

### 3. DTOs & Validation (`apps/api/src/modules/*/dto/`)

- Create and Update DTOs with `class-validator` (`IsString`, `IsNotEmpty`, `IsUUID`, `IsEnum`, `IsNumber`, `IsOptional`, `IsDateString`, `Min`, `Max`, `Length`).

### 4. Services & Controllers (`apps/api/src/modules/*`)

- Implement CRUD operations for Doctor, Slot, Appointment, Prescription, and MedicalNote services.
- Expose REST controllers:
  - `/doctors` (GET, GET /:id, POST, PATCH /:id, DELETE /:id)
  - `/slots` (GET, GET /:id, POST, PATCH /:id, DELETE /:id)
  - `/appointments` (GET, GET /:id, POST, PATCH /:id, DELETE /:id)
  - `/prescriptions` (GET, GET /:id, POST, PATCH /:id, DELETE /:id)
  - `/medical-notes` (GET, GET /:id, POST, PATCH /:id, DELETE /:id)

### 5. Migration & Seed Script (`apps/api/src/database/`)

- Generate and verify TypeORM migration for domain tables.
- Create seed script to populate realistic initial data:
  - 3 Doctors
  - 12 Slots (mixed AVAILABLE/BOOKED)
  - 4 Appointments
  - 2 Prescriptions
  - 5 Medical Notes

---

## Phase 2: Frontend Mock Pages & Component Architecture (`apps/web`)

### 1. Types & API Services (`apps/web/features/*/types`, `apps/web/features/*/services`)

- Create TypeScript interfaces matching backend DTOs and entities (`Doctor`, `Slot`, `Appointment`, `Prescription`, `MedicalNote`).
- Implement API service modules with mocked data fallbacks for initial Day 2 preview.

### 2. Reusable UI Components (`apps/web/components/*` & `apps/web/features/*`)

- `DoctorCard` & `DoctorTable`: Display doctor profiles, specialization badges, consultation fee, experience, and action buttons.
- `SlotCard`: Display time window, status badge (`AVAILABLE`, `BOOKED`, `BLOCKED`), and slot management controls.
- `AppointmentCard`: Display appointment details, patient/doctor info, date/time, and status badge.
- `EmptyState`, `LoadingSkeleton`, `ErrorState`: Standardized state feedback using `@shared/ui/components`.

### 3. Pages & TanStack Query Integration (`apps/web/app/(dashboard)/*`)

- `/doctors`: Doctors listing with filter controls (specialization, active status) and grid/table views.
- `/doctor/[id]`: Detailed doctor profile view with available slot schedule and medical bio.
- `/appointments`: Appointments overview list with tabbed status filters (`All`, `Scheduled`, `Completed`, `Cancelled`).
- Implement custom TanStack Query hooks (`useDoctors`, `useDoctor`, `useSlots`, `useAppointments`) connecting pages to feature services.

---

## Phase 3: Documentation Updates (`docs/docs/`)

- **`ERD.md`**: Update Entity Relationship Diagram reflecting exact primary keys, foreign keys, and cardinalities.
- **`DATABASE_DESIGN.md`**: Document table schemas, column types, constraints, index details, and repository abstractions.
- **`API_CONTRACT.md`**: Document all REST endpoints, request parameters, DTO body structures, and response samples.

---

## Phase 4: Verification & Quality Assurance

1. Run `pnpm typecheck` to verify zero TypeScript compilation errors across the monorepo.
2. Run `pnpm lint` to verify zero ESLint rule violations.
3. Test migration run (`pnpm migration:run:api`) and database seeding.
4. Verify Next.js build (`pnpm build:web`) and Nest API build (`pnpm build:api`).
