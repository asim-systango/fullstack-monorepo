# Day 5 Implementation Plan — Clinical Workflow, Advanced Appointment Access & Search

## Overview & Objective

Day 1 through Day 4 delivered the monorepo foundation, authentication, role-based access control, database schema, doctor profiles, slot management, and the core transactional booking engine with pessimistic locking.

The goal for **Day 5** is to implement the post-booking clinical workflow, role-scoped appointment access, clinical medical notes, prescription management, and hospital-wide admin appointment search across backend (`apps/api`), frontend (`apps/web`), and technical documentation (`docs/docs`).

The primary technical directive of Day 5 is to strictly enforce role-based ownership on appointment queries while completing clinical completion flows and advanced hospital-wide filtering.

---

## Architectural & Coding Rules (Derived from `/docs` & `day5.md`)

1. **Role-Based Appointment Access & Security**:
   - Never trust `patientId` or `doctorId` query parameters supplied by frontend when they can be derived from authenticated user JWT payload (`req.user`) and domain entities.
   - **PATIENT**: Can access ONLY their own appointments (`patientId = req.user.id`). Internal medical notes are concealed from patient views.
   - **DOCTOR**: Can access ONLY appointments linked to slots belonging to their `DoctorProfile` (`userId = req.user.id`).
   - **ADMIN**: Can access, search, and filter all appointments hospital-wide.

2. **Clinical Workflow & Appointment Completion**:
   - Endpoint `POST /appointments/:id/complete` (or `PATCH /appointments/:id/complete`) allows assigned Doctor or Admin to mark appointment as `COMPLETED`.
   - Transactionally record attached **Prescription** (`medicines`, `instructions`) and **Medical Note** (`notes`).
   - Disallow completing appointments that are `CANCELLED` or already `COMPLETED`.

3. **Hospital-Wide Search & Advanced Filtering**:
   - Support `q` query parameter for searching doctor name, patient name/email, and visit reason.
   - Hardened filter support for `status`, `dateFrom`, `dateTo`, `doctorId`, `patientId`, `page`, `limit`, and `sort`.

4. **Frontend Integration & UX**:
   - Doctor clinical portal view with appointment list and "Complete Visit" action dialog.
   - Dynamic Prescription form (medicines array: name, dosage, frequency, duration) and Clinical Medical Note form.
   - Admin hospital-wide appointment search UI with search bar and filter controls.
   - Patient view with patient-safe appointment details and prescription summary.

---

## Phase 1: Backend Security Scoping & Clinical APIs (`apps/api`)

### 1. Role Scoping in `AppointmentController` & `AppointmentService`

- Remove `@Public()` decorator from `GET /appointments` and `GET /appointments/:id`. Require JWT authentication.
- In `findAll`:
  - Extract `@CurrentUser() user: JwtUser`.
  - For `PATIENT`: force `patientId = user.id`.
  - For `DOCTOR`: lookup `DoctorProfile` where `userId = user.id` and force `doctorId = doctorProfile.id`.
  - For `ADMIN`: allow search parameter `q` and optional filters (`patientId`, `doctorId`, `status`, `dateFrom`, `dateTo`).
- In `findOne`:
  - Perform role ownership validation before returning appointment details.
  - Exclude/strip internal medical notes if requested by a `PATIENT`.

### 2. Clinical Completion Workflow Endpoint

- Implement `POST /appointments/:id/complete` (and/or `PATCH /appointments/:id/complete`):
  - DTO accepts `prescription?: { medicines: MedicineItemDto[], instructions?: string }` and `medicalNote?: { notes: string }`.
  - Service transaction: verify appointment is `SCHEDULED`, check Doctor/Admin ownership, set status to `COMPLETED`, save Prescription (1:1), save MedicalNote (1:N), commit transaction.

### 3. Repository Search Query Builder Hardening

- Update `AppointmentRepository.findAll` to handle search string `q` matching doctor first/last name, patient name/email (via User left join), or appointment reason.

### 4. Prescription & Medical Note Security Enforcement

- Secure `PrescriptionController` and `MedicalNoteController` by removing `@Public()`.
- Enforce doctor/admin creation and patient read ownership.

---

## Phase 2: Frontend Clinical UI & Search Integration (`apps/web`)

### 1. Domain Feature Services & Hooks

- Update `features/appointment`: types, `completeAppointment` service & hook `useCompleteAppointment()`.
- Update `features/prescription` & `features/medical-note` hooks if required.

### 2. Components & UI Views

- **Complete Appointment Dialog (`CompleteAppointmentModal`)**: Form for doctors to mark appointment complete, input medicine details, instructions, and clinical notes.
- **Doctor Portal Page (`/doctor/appointments` / `/doctor/dashboard`)**: Dedicated view for doctors to manage scheduled visits, view patient reason, and launch completion modal.
- **Admin Search UI (`/admin/appointments`)**: Hospital-wide search bar, date range picker, doctor selector, and status tabs.
- **Patient Detail Cards**: Enhanced appointment card with patient-safe prescription view and clean status badges.

---

## Phase 3: Technical Documentation & Seed Data

- Update `API_CONTRACT.md`, `DATABASE_DESIGN.md`, `Architecture.md` for Day 5 endpoints, search filters, and clinical workflow.
- Update `seed.ts` to include completed appointments with prescriptions and medical notes.

---

## Phase 4: Verification & Quality Assurance

1. Typecheck: `pnpm typecheck` (0 errors).
2. Lint: `pnpm lint` and `pnpm lint:sonar` (0 errors).
3. DB Seed: `pnpm seed`.
4. Unit Tests: `pnpm test`.
