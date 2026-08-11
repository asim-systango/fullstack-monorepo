# Day 6 Subtask Checklist — Integration, Hardening, Testing & Assessment Verification

## Legend

- [ ] Pending
- [/] In Progress
- [x] Completed

---

## 1. Backend Integration & Domain Hardening (`apps/api`)

- [ ] Task 1.1: Enhance `DoctorService.remove()` to atomically soft-delete doctor profile and deactivate (set `status = BLOCKED`) all future available slots (`startsAt > NOW()`).
- [ ] Task 1.2: Audit `DoctorRepository.findAll` and `DoctorRepository.findById` to ensure soft-deleted doctors are omitted from public directory queries.
- [ ] Task 1.3: Audit `AppointmentService.create()` to ensure `patientId` strictly uses authenticated user ID and pessimistic write locking returns `409 Conflict` on concurrent slot booking attempts.
- [ ] Task 1.4: Audit `AppointmentService.remove()` to enforce patient ownership (403 on unauthorized attempt) and guarantee slot status is set to `AVAILABLE` atomically upon cancellation.

---

## 2. Unit, Integration & Hardening Test Suite Expansion (`apps/api`)

- [ ] Task 2.1: Expand `apps/api/src/modules/appointment/appointment.service.spec.ts`:
  - Double booking concurrency / conflict test (409 Conflict).
  - Patient self-only booking test (ignoring supplied patientId).
  - Unauthorized cancellation rejection test (403 Forbidden).
  - Cancellation slot recovery test (slot becomes AVAILABLE).
  - Transaction rollback on booking error test.
  - Transaction rollback on cancellation error test.
  - Past slot booking rejection test (400 Bad Request).
  - Blocked slot booking rejection test (409 Conflict).
  - State machine invariant tests (disallow completing cancelled/completed, cancelling completed/cancelled).
  - Invalid date range filter test (`dateFrom > dateTo` -> 400 Bad Request).
- [ ] Task 2.2: Expand `apps/api/src/modules/doctor/doctor.service.spec.ts`:
  - Doctor soft-delete deactivating future available slots.
  - Soft-deleted doctor hidden from public queries.

---

## 3. Frontend Integration & UX Hardening (`apps/web`)

- [ ] Task 3.1: Audit API error handling in `apps/web/features/appointment` and `apps/web/app`: ensure explicit, human-friendly error messaging for 409 Conflict ("This slot was just booked by another patient"), 403 Forbidden, 404, and 400 validation errors.
- [ ] Task 3.2: Verify loading skeletons, empty state components, and role-based navigation across Patient, Doctor, and Admin pages.

---

## 4. Assessment Verification Script & Evaluation Demo

- [ ] Task 4.1: Create `tools/scripts/verify-assessment.sh` script to validate environment, TypeScript compilation, linting, tests, database migrations, and seed data.
- [ ] Task 4.2: Create `docs/DEMO.md` evaluation guide outlining the 5-minute evaluation demonstration across roles, happy path, cancellation, double-booking, and authorization edge cases.

---

## 5. Documentation Updates (`docs/docs/`)

- [ ] Task 5.1: Synchronize `docs/docs/API_CONTRACT.md` with final error codes, DTO schemas, and query parameter specifications.
- [ ] Task 5.2: Synchronize `docs/docs/DATABASE_DESIGN.md` and `docs/docs/ERD.md` with entity models, soft-delete constraints, and indexes.
- [ ] Task 5.3: Update `docs/docs/AUTHENTICATION.md` and `docs/docs/RBAC.md` with role authorization matrix and ownership enforcement logic.
- [ ] Task 5.4: Update `docs/docs/SetupGuide.md` and `docs/docs/Architecture.md` with final system architecture and verification execution instructions.

---

## 6. Verification & Engineering Report

- [ ] Task 6.1: Run `pnpm typecheck` (0 errors).
- [ ] Task 6.2: Run `pnpm lint` and `pnpm lint:sonar` (0 errors).
- [ ] Task 6.3: Run `pnpm test` (all test suites pass).
- [ ] Task 6.4: Run `bash tools/scripts/verify-assessment.sh` (all checks pass).
- [ ] Task 6.5: Format and output the final Day 6 Engineering Report according to standard template.
