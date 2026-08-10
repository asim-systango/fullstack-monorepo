# Day 4 Subtask Checklist — Appointment Booking Engine, Transactions & Slot Management

## Legend

- [ ] Pending
- [x] Completed

---

## 1. Backend Booking Engine, Slot APIs & Concurrency Control (`apps/api`)

### Database Indexes & Entity Verification

- [ ] Task 1.1: Verify/add database indexes on `Slot` entity (`doctorId`, `startsAt`, `status`) and `Appointment` entity (`patientId`, `status`, `slotId`).
- [ ] Task 1.2: Verify soft delete support on `Appointment` (`deletedAt`) and CHECK constraint `starts_at < ends_at` on `Slot`.

### Slot Management Service & APIs

- [ ] Task 1.3: Implement `GET /doctors/:id/slots` returning future `AVAILABLE` slots sorted by `startsAt` ASC.
- [ ] Task 1.4: Implement `POST /slots` for slot creation with 30-minute duration validation, future time restriction, and overlap prevention.
- [ ] Task 1.5: Implement `PATCH /slots/:id` to support blocking (`BLOCKED`) and unblocking (`AVAILABLE`) slots.
- [ ] Task 1.6: Implement `DELETE /slots/:id` allowing deletion of unused slots while rejecting deletion of `BOOKED` slots.

### Transactional Booking Engine & Cancellation

- [ ] Task 1.7: Refactor `AppointmentService.create` to use TypeORM `QueryRunner` / `DataSource.transaction()`.
- [ ] Task 1.8: Implement **Pessimistic Write Locking** (`pessimistic_write`) on `Slot` lookup during booking to prevent double-booking concurrent requests.
- [ ] Task 1.9: Enforce JWT patient identity (`req.user.id`) for appointment booking, rejecting external patientId overrides.
- [ ] Task 1.10: Return HTTP `409 Conflict` when attempting to book a slot that is already booked or locked.
- [ ] Task 1.11: Atomic update of slot status to `BOOKED` and creation of `Appointment` inside transaction block with automatic rollback on error.
- [ ] Task 1.12: Refactor `AppointmentService.remove` to perform transactional cancellation: verify ownership, set appointment status to `CANCELLED`, soft delete appointment, and free slot to `AVAILABLE`.
- [ ] Task 1.13: Prevent cancellation of completed or already cancelled appointments.

### QueryBuilder, Filtering & Pagination

- [ ] Task 1.14: Update `GET /appointments` with TypeORM QueryBuilder supporting `status`, `doctorId`, `patientId`, `dateFrom`, `dateTo` filters, pagination (`page`, `limit`), and sorting (`createdAt`, `startsAt`).
- [ ] Task 1.15: Annotate all Slot and Appointment endpoints with complete Swagger OpenAPI decorators.

### Seed Data & Logging

- [ ] Task 1.16: Add structured NestJS logging in `AppointmentService` and `SlotService` with user ID, slot ID, and appointment ID details.
- [ ] Task 1.17: Update `seed.ts` script to generate 3 Doctors, 20 Future Slots, and 6 Appointments across various statuses.

---

## 2. Frontend Integration & Booking Workflow (`apps/web`)

### Domain Feature Services & TanStack Query Hooks

- [ ] Task 2.1: Define TypeScript types for slots and appointments in `features/slot/types.ts` and `features/appointment/types.ts`.
- [ ] Task 2.2: Implement API service functions for slot retrieval and management in `features/slot/services.ts`.
- [ ] Task 2.3: Implement API service functions for appointment creation, listing, and cancellation in `features/appointment/services.ts`.
- [ ] Task 2.4: Create TanStack Query hooks (`useDoctorSlots`, `useAppointments`, `useBookAppointment`, `useCancelAppointment`) with automatic cache invalidation.

### UI Pages & Components Integration

- [ ] Task 2.5: Update `/doctors` page to list doctor profiles with specialization filters and availability links.
- [ ] Task 2.6: Build `/doctors/[id]` detail page with doctor header, interactive slot picker grid (`SlotCard`), and booking trigger.
- [ ] Task 2.7: Implement `BookingModal` component with appointment details, reason input, loading state, error feedback, and success redirect.
- [ ] Task 2.8: Build `/appointments` page displaying patient/doctor appointments with filter bar (status, date range) and pagination.
- [ ] Task 2.9: Implement `AppointmentCard` and `StatusBadge` components for clean status rendering.
- [ ] Task 2.10: Implement `CancelDialog` component with confirmation modal, loading feedback, and toast notification.
- [ ] Task 2.11: Connect all frontend pages to live backend APIs, replacing mock data and ensuring empty/loading/error states.

---

## 3. Technical Documentation (`docs/docs/`)

- [ ] Task 3.1: Update `docs/docs/API_CONTRACT.md` with booking, cancellation, and slot API specifications, payload examples, and 409/422 responses.
- [ ] Task 3.2: Update `docs/docs/DATABASE_DESIGN.md` with transaction state machine, pessimistic locking strategy, and index details.
- [ ] Task 3.3: Update `docs/docs/Architecture.md` with sequence diagrams for booking and cancellation flows.

---

## 4. Verification & Quality Assurance

- [ ] Task 4.1: Run `pnpm typecheck` across all monorepo workspace packages (0 errors).
- [ ] Task 4.2: Run `pnpm lint` and `pnpm lint:sonar` ensuring 0 warnings and 0 errors.
- [ ] Task 4.3: Run `pnpm seed` to verify DB seeding of doctors, slots, and appointments.
- [ ] Task 4.4: Run unit tests with `pnpm test`.
