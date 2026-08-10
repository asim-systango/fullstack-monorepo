# Day 4 Implementation Plan — Appointment Booking Engine, Transactions & Slot Management

## Overview & Objective

Day 1, Day 2, and Day 3 established the monorepo foundation, database architecture, domain entities, repositories, frontend layout, and global JWT Authentication & RBAC system.
The goal for **Day 4** is to implement the core business logic of the Hospital Appointment System: an enterprise-grade, concurrent, transaction-safe **Appointment Booking Engine, Slot Management System, and Cancellation Workflow** across backend (`apps/api`), frontend (`apps/web`), and technical documentation (`docs/docs`).

The primary technical directive of Day 4 is to guarantee data consistency and ensure double-booking of any consultation slot is strictly impossible under high concurrency.

---

## Architectural & Coding Rules (Derived from `/docs` & `day4.md`)

1. **Transactional Integrity & Concurrency Protection**:
   - Every booking and cancellation operation must execute inside an isolated database transaction using TypeORM `QueryRunner` or `DataSource.transaction()`.
   - Use **Pessimistic Write Locking** (`pessimistic_write` / `SELECT ... FOR UPDATE`) on slot lookup to prevent concurrent double-booking.
   - If a slot is already booked or locked by another transaction, return **409 Conflict**.
2. **Ownership & Identity Security**:
   - Patients can ONLY book appointments for themselves. `patientId` must be derived from the verified JWT payload (`req.user.id`), NEVER from request body.
   - Patients can only view and cancel their own appointments.
   - Doctors can only manage their own consultation slots.
   - Admin users possess global access across all appointments and slots.
3. **Slot & Appointment Business Rules**:
   - Consultation slots are strictly 30 minutes in duration (`startsAt < endsAt`), cannot be created in the past, and cannot overlap for the same doctor.
   - Slot status lifecycle: `AVAILABLE` ↔ `BOOKED` | `BLOCKED`. A slot must never be set to `BOOKED` without an associated active appointment.
   - Appointment status lifecycle: `SCHEDULED` → `CANCELLED` | `COMPLETED`.
   - Cancellation must NOT hard-delete appointments; soft delete (`deletedAt` timestamp) while changing status to `CANCELLED` and setting the linked slot back to `AVAILABLE`.
4. **Backend API Performance & Queries**:
   - QueryBuilder optimized queries with explicit select fields and joins to eliminate N+1 query problems.
   - Proper database indexing on `Appointment` (`patientId`, `status`, `slotId`), `Slot` (`doctorId`, `startsAt`, `status`), and `DoctorProfile` (`specialization`).
   - Full Swagger OpenAPI annotation and structured NestJS logging for all booking, cancellation, and slot operations.
5. **Frontend State & Experience**:
   - TanStack Query hooks with automatic cache invalidation on booking/cancellation mutations.
   - Complete replacement of mock data across `/doctors`, `/doctors/[id]`, and `/appointments`.
   - Robust loading, empty, and error feedback states.

---

## Phase 1: Backend Booking Engine & Slot APIs (`apps/api`)

### 1. Database Indexes & Entity Verification

- **`Slot` Entity**: Verify/add composite & single indexes on `doctorId`, `startsAt`, and `status`. Ensure `CHECK ("starts_at" < "ends_at")` constraint.
- **`Appointment` Entity**: Verify/add indexes on `patientId`, `status`, and unique index on `slotId`. Soft delete enabled via `@DeleteDateColumn`.
- **`DoctorProfile` Entity**: Verify index on `specialization`.

### 2. Slot Management System (`SlotModule`, `SlotService`, `SlotController`)

- **APIs**:
  - `GET /doctors/:id/slots`: Returns available (`AVAILABLE`), future slots for doctor sorted by `startsAt` ASC.
  - `GET /slots`: Filterable by `doctorId`, `status`, `startDate`, `endDate`.
  - `POST /slots`: Doctor/Admin creates consultation slot. Validates 30-min duration, future time, and overlap checking.
  - `PATCH /slots/:id`: Block (`BLOCKED`) / Unblock (`AVAILABLE`) slot.
  - `DELETE /slots/:id`: Delete unbooked slot. Rejects deletion if slot status is `BOOKED`.

### 3. Transactional Booking Engine (`AppointmentModule`, `AppointmentService`, `AppointmentController`)

- **APIs**:
  - `POST /appointments`: Accepts `slotId`, `reason`. Resolves `patientId` from JWT user.
    - Transaction workflow: Start `QueryRunner` → Lock Slot (`pessimistic_write`) → Validate slot availability, future time, doctor status, patient status → Create `Appointment` (`SCHEDULED`) → Set Slot status `BOOKED` → Commit transaction.
    - Rollback transaction and return `409 Conflict` if slot already booked/locked, or `400/422` on validation error.
  - `DELETE /appointments/:id`: Cancel appointment.
    - Ownership check: Ensure caller is owner patient or Admin.
    - Transaction workflow: Lock Appointment & Slot → Update appointment status to `CANCELLED` → Soft delete appointment → Update slot status to `AVAILABLE` → Commit transaction.
  - `GET /appointments`: Paginated and filterable list of appointments by `status`, `doctorId`, `patientId`, `dateFrom`, `dateTo`. Optimized QueryBuilder.
  - `GET /appointments/:id`: Retrieve single appointment with slot and doctor details.

### 4. Structured Logging & Seed Data

- Inject NestJS `Logger` in `AppointmentService` and `SlotService` tracking user ID, slot ID, and appointment ID for all state transitions.
- Update `seed.ts` script to populate:
  - 3 Doctor profiles with complete details.
  - 20 Future consultation slots across doctors.
  - 6 Appointments with mixed statuses (`SCHEDULED`, `CANCELLED`, `COMPLETED`).

---

## Phase 2: Frontend Integration & Booking Flow (`apps/web`)

### 1. Feature Domain Services & TanStack Query Hooks

- **`features/slot`**:
  - Services: `getDoctorSlots`, `getSlots`, `createSlot`, `updateSlotStatus`, `deleteSlot`.
  - Hooks: `useDoctorSlots(doctorId)`, `useCreateSlot()`, `useUpdateSlotStatus()`.
- **`features/appointment`**:
  - Services: `getAppointments`, `getAppointmentById`, `createAppointment`, `cancelAppointment`.
  - Hooks: `useAppointments(filters)`, `useAppointment(id)`, `useBookAppointment()`, `useCancelAppointment()`.
  - Automatic cache invalidation: Invalidate `['appointments']` and `['slots']` on booking/cancellation success.

### 2. UI Pages & Components Integration

- **`/doctors` Page**: Doctor listing with specialization filters, search, and doctor cards with "View Availability" action.
- **`/doctors/[id]` Page**: Doctor profile header, date picker / day selector, available slots grid (`SlotCard`), and "Book Appointment" trigger.
- **`BookingModal` Component**: Confirmation modal displaying selected doctor, date/time, slot details, reason textarea, loading spinner, error feedback, and success toast + redirect to `/appointments`.
- **`/appointments` Page**: Comprehensive appointment management interface:
  - Filter bar (status selector, date range picker).
  - Appointment cards with status badges (`SCHEDULED`, `CANCELLED`, `COMPLETED`), doctor details, slot time, and "Cancel Appointment" action.
  - Pagination controls.
- **`CancelDialog` Component**: Confirmation dialog explaining cancellation rules, action button, loading state, and toast feedback.

---

## Phase 3: Technical Documentation (`docs/docs/`)

- **`API_CONTRACT.md`**: Update specs for `/appointments`, `/appointments/:id`, `/slots`, `/doctors/:id/slots`, including request payloads, response schemas, and 409/422 status codes.
- **`DATABASE_DESIGN.md`**: Document `Slot` and `Appointment` transaction state machines, pessimistic lock strategy, and index definitions.
- **`Architecture.md`**: Add sequence diagrams for Booking Flow & Cancellation Flow, detailing transaction lifecycle and error handling.

---

## Phase 4: Verification & Quality Assurance

1. Workspace type checking: `pnpm typecheck` (0 errors).
2. Workspace linting: `pnpm lint` and `pnpm lint:sonar` (0 errors).
3. Database migration & seed verification: `pnpm migration:run:api` & `pnpm seed`.
4. Automated unit tests: `pnpm test`.
