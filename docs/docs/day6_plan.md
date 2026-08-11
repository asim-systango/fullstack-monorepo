# Day 6 Implementation Plan — Full Integration, Testing, Security & Assessment Hardening

## Overview & Objective

Day 1 through Day 5 delivered the complete Hospital Appointment System: monorepo architecture, authentication, role-based authorization, database schema & migrations, doctor profiles, slot management, transactional booking with pessimistic locking, clinical completion workflow, prescriptions, medical notes, and admin hospital-wide search.

**Day 6** is an **integration and hardening day**. Our goal is NOT to add new unrequested features (no payment gateways, no SMS, no AI), but to make the existing system robust, reliable, secure, fully tested, and ready for production-style evaluation.

---

## Technical Audit Findings & Hardening Goals

1. **Doctor Soft-Delete & Slot Deactivation Invariant**:
   - Currently, `DoctorService.remove()` soft-deletes the `DoctorProfile` record.
   - **Hardening**: Must atomically deactivate (set `status = BLOCKED`) all future available slots (`startsAt > NOW()`) belonging to that soft-deleted doctor, ensuring patients cannot book orphaned slots.

2. **Comprehensive Test Suite Expansion**:
   - Add unit/integration tests for critical Day 6 scenarios:
     - Concurrency / double-booking conflict prevention (409 Conflict).
     - Unauthorized cancellation attempts by non-owner patients (403 Forbidden).
     - Patient attempt to book for another user (self-only ownership check).
     - Atomic slot release on appointment cancellation.
     - Rollback verification during booking or cancellation failures.
     - State machine invariant enforcement: disallow completing/cancelling completed appointments or cancelling cancelled appointments.
     - Date filtering edge cases (`dateFrom > dateTo` returning 400 Bad Request).
     - Doctor soft-delete deactivating future slots.

3. **Frontend UX Hardening & Error Handling**:
   - Audit error handling across API hooks and forms to ensure explicit, user-friendly messages for `409` ("This slot was just booked by another patient."), `403` ("You do not have permission to perform this action."), `404` ("Appointment not found."), and `400` validation errors.
   - Verify loading skeletons, empty state components, and role-scoped navigation across Patient, Doctor, and Admin views.

4. **Assessment Verification Script**:
   - Create `tools/scripts/verify-assessment.sh` to run system-wide readiness checks: build, lint, typecheck, unit tests, DB migration, and seed verification.

5. **Evaluation Demo & Technical Documentation**:
   - Create `docs/DEMO.md` detailing a step-by-step 5-minute evaluation guide for human evaluators.
   - Audit and synchronize `API_CONTRACT.md`, `DATABASE_DESIGN.md`, `AUTHENTICATION.md`, `RBAC.md`, and `SetupGuide.md` in `docs/docs/` to reflect actual application implementation.

---

## Phase 1: Backend Domain & Security Hardening (`apps/api`)

### 1. Doctor Soft-Delete Cascading Slot Deactivation

- Update `DoctorService.remove(id)` to execute a transaction:
  1. Soft-delete `DoctorProfile` (`deletedAt = NOW()`, `isActive = false`).
  2. Query all future slots for this doctor (`doctorId = id`, `startsAt > NOW()`, `status = AVAILABLE`).
  3. Batch update those future slots to `status = BLOCKED`.

### 2. Double-Booking & Ownership Verification

- Verify `AppointmentService.create`:
  - Enforces `patientId = req.user.id` (ignoring any payload override attempt).
  - Uses pessimistic write locking (`lock: { mode: 'pessimistic_write' }`) to reject concurrent double-bookings with `409 Conflict`.
- Verify `AppointmentService.remove`:
  - Validates `appointment.patientId === req.user.id` for Patients (throwing `ForbiddenException` on unauthorized attempts).
  - Restores `slot.status = AVAILABLE` atomically in transaction.

---

## Phase 2: Comprehensive Test Hardening (`apps/api/src/modules/*`)

### 1. Appointment Service Unit & Integration Tests (`appointment.service.spec.ts`)

- Double booking concurrency test simulation.
- Patient booking for another user test.
- Unauthorized cancellation rejection test (403 Forbidden).
- Cancellation slot recovery test.
- Booking and cancellation transaction rollback tests.
- State machine invariant tests (`COMPLETED -> CANCELLED`, `CANCELLED -> COMPLETED`, `COMPLETED -> SCHEDULED`).
- Date range filter validation test (`dateFrom > dateTo`).
- Prescription & Medical Note authorization tests.

### 2. Doctor Service Unit & Integration Tests (`doctor.service.spec.ts`)

- Soft-delete test verifying doctor `deletedAt` set and future slots updated to `BLOCKED`.
- Query filtering test verifying soft-deleted doctors are omitted from public directory.

---

## Phase 3: Frontend UX Polish & Error Handling (`apps/web`)

### 1. Unified Error Notification & Toast Feedback

- Audit slot booking, appointment cancellation, and visit completion modals in `apps/web`.
- Handle `409` conflict error gracefully with custom user notification ("This slot was just booked by another patient. Please select another slot.").
- Handle `403` permission errors with clear feedback.

### 2. Loading Skeletons & Empty States

- Verify loading state skeletons for Doctor Directory (`/doctors`), Slots grid, Patient Appointments (`/appointments`), Doctor Portal (`/doctor/appointments`), and Admin Search (`/admin/appointments`).
- Ensure empty state cards with helpful call-to-action buttons when no data is returned.

---

## Phase 4: Verification Tooling, Documentation & Evaluation Demo

### 1. Assessment Script (`tools/scripts/verify-assessment.sh`)

- Executable bash script checking TypeScript compilation, ESLint, unit tests, DB connectivity, migrations, and seed data.

### 2. Demo Guide (`docs/DEMO.md`)

- Comprehensive step-by-step walkthrough covering 3 User Roles (Patient, Doctor, Admin), Happy Path Booking, Cancellation, Concurrency 409 Conflict, and RBAC 403 Guarding.

### 3. Documentation Synchronization (`docs/docs/`)

- Review and update `API_CONTRACT.md`, `DATABASE_DESIGN.md`, `AUTHENTICATION.md`, `RBAC.md`, and `SetupGuide.md` for consistency.

---

## Phase 5: Verification & Assessment Report Generation

1. Run `pnpm typecheck` across all workspace packages (0 errors).
2. Run `pnpm lint` and `pnpm lint:sonar` (0 errors).
3. Run `pnpm test` (all unit & integration test suites passing).
4. Run `tools/scripts/verify-assessment.sh`.
5. Produce final engineering report adhering to Day 6 specifications.
