# Day 5 Subtask Checklist — Clinical Workflow, Advanced Appointment Access & Search

## Legend

- [ ] Pending
- [x] Completed

---

## 1. Backend Security Scoping, Clinical Workflow & Search APIs (`apps/api`)

### Role Scoping & Access Control

- [ ] Task 1.1: Remove `@Public()` decorator from `GET /appointments` and `GET /appointments/:id` in `AppointmentController`.
- [ ] Task 1.2: Implement role-based query scoping in `AppointmentController.findAll`: force `patientId = user.id` for Patients, `doctorId` derived from `DoctorProfile` for Doctors, and allow global filters for Admins.
- [ ] Task 1.3: Implement ownership check in `AppointmentController.findOne`: block unauthorized access across patients/doctors and strip internal medical notes for Patients.

### Clinical Completion Workflow & Prescriptions/Notes

- [ ] Task 1.4: Create `CompleteAppointmentDto` supporting optional prescription medicines/instructions and clinical medical notes.
- [ ] Task 1.5: Implement `POST /appointments/:id/complete` in `AppointmentController` & `AppointmentService` executing atomic completion transaction.
- [ ] Task 1.6: Secure `PrescriptionController` and `MedicalNoteController` by enforcing authentication and role checks.

### QueryBuilder & Search Hardening

- [ ] Task 1.7: Extend `AppointmentRepository.findAll` to handle search parameter `q` matching doctor name, patient name/email, and visit reason.
- [ ] Task 1.8: Add full Swagger OpenAPI annotations for appointment completion and search query parameters.

### Seed Data & Logging

- [ ] Task 1.9: Update `seed.ts` script to generate completed appointments with attached prescriptions and clinical notes.
- [ ] Task 1.10: Add structured NestJS logging for clinical completion, prescription generation, and search operations.

---

## 2. Frontend Integration & Clinical UI (`apps/web`)

### Domain Services & Hooks

- [ ] Task 2.1: Update TypeScript types in `features/appointment/types.ts` for completion DTOs, prescriptions, and medical notes.
- [ ] Task 2.2: Add `completeAppointment` service function and `useCompleteAppointment` TanStack Query hook with cache invalidation.

### Components & UI Views

- [ ] Task 2.3: Build `CompleteAppointmentModal` component with dynamic prescription medicines form and medical note text area.
- [ ] Task 2.4: Build Doctor appointment portal view (`/doctor/appointments`) allowing doctors to manage their visits and complete appointments.
- [ ] Task 2.5: Build Admin hospital-wide appointment search UI (`/admin/appointments`) with search input `q`, doctor selector, and status filters.
- [ ] Task 2.6: Enhance `AppointmentCard` to display patient-safe prescription summaries for patients while concealing internal clinical notes.
- [ ] Task 2.7: Ensure loading, error, and empty feedback states across doctor and admin views.

---

## 3. Technical Documentation (`docs/docs/`)

- [ ] Task 3.1: Update `docs/docs/API_CONTRACT.md` with completion endpoint, prescription/notes schemas, and search parameters.
- [ ] Task 3.2: Update `docs/docs/DATABASE_DESIGN.md` with clinical workflow entity relationships and prescription/note data models.
- [ ] Task 3.3: Update `docs/docs/Architecture.md` with clinical completion flow sequence diagram.

---

## 4. Verification & Quality Assurance

- [ ] Task 4.1: Run `pnpm typecheck` across monorepo workspace (0 errors).
- [ ] Task 4.2: Run `pnpm lint` and `pnpm lint:sonar` (0 errors).
- [ ] Task 4.3: Run `pnpm seed` to verify DB seeding.
- [ ] Task 4.4: Run unit tests with `pnpm test`.
