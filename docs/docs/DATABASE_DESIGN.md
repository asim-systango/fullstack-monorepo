# Database Design & Schema Specification — Day 04

This document describes the PostgreSQL relational database schema, data types, indexes, transactional locking strategies, and constraints implemented in TypeORM.

---

## Database Indexing Strategy

To guarantee maximum Query Builder performance and eliminate N+1 latency, the following database indexes are created:

| Entity | Indexed Column | Index Type | Purpose |
|---|---|---|---|
| `DoctorProfile` | `specialization` | B-Tree | Fast lookup for specialist filtering in directory |
| `Slot` | `doctorId` | B-Tree | Quick relation joins for doctor schedule lookup |
| `Slot` | `startsAt` | B-Tree | Chronological sorting and range queries (`dateFrom`, `dateTo`) |
| `Slot` | `status` | B-Tree | Filtering active `AVAILABLE` slots |
| `Appointment` | `patientId` | B-Tree | Ownership filtering & user appointment history |
| `Appointment` | `status` | B-Tree | Filter by `SCHEDULED`, `COMPLETED`, `CANCELLED` |
| `Appointment` | `slotId` | Unique B-Tree | Ensures 1:1 relation between Appointment and Slot |

---

## Concurrency Protection & Locking Strategy

### Pessimistic Write Locking (`SELECT FOR UPDATE`)

To prevent race conditions and guarantee zero double-booking under concurrent traffic:

1. **Booking Transaction**:
   - `queryRunner.manager.findOne(Slot, { where: { id }, lock: { mode: 'pessimistic_write' } })`
   - Executes `SELECT * FROM slots WHERE id = $1 FOR UPDATE`.
   - Any concurrent request attempting to book the same `slotId` blocks at the database level until the first transaction commits or rolls back.
   - If slot status becomes `BOOKED`, the subsequent transaction immediately fails with a `409 Conflict` error.

2. **Cancellation Transaction**:
   - Acquires `pessimistic_write` lock on `appointments` and linked `slots` row.
   - Updates appointment status to `CANCELLED` (with `deletedAt` soft delete) and updates slot status back to `AVAILABLE`.

---

## Database Tables Overview

### 1. `doctor_profiles`
Stores professional practitioner metadata.

| Column | Data Type | Constraints / Indexes | Description |
|---|---|---|---|
| `id` | `UUID` | Primary Key, `uuid_generate_v4()` | Unique doctor profile ID |
| `userId` | `UUID` | UNIQUE, NOT NULL | Account User reference |
| `firstName` | `VARCHAR(50)` | NOT NULL | Doctor first name |
| `lastName` | `VARCHAR(50)` | NOT NULL | Doctor last name |
| `specialization` | `VARCHAR(100)` | INDEX, NOT NULL | Medical specialty (e.g. Cardiology) |
| `qualification` | `VARCHAR(100)` | NOT NULL | Medical degrees (e.g. MD, FACC) |
| `experienceYears` | `INTEGER` | DEFAULT 0 | Years of clinical experience |
| `consultationFee` | `NUMERIC(10,2)` | DEFAULT 0.00 | Consultation fee in USD |
| `biography` | `TEXT` | NULLABLE | Detailed professional bio |
| `profileImage` | `VARCHAR(255)` | NULLABLE | Profile photo URL |
| `isActive` | `BOOLEAN` | DEFAULT `true` | Active status toggle |
| `createdAt` | `TIMESTAMPTZ` | DEFAULT `now()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | DEFAULT `now()` | Record last update timestamp |
| `deletedAt` | `TIMESTAMPTZ` | NULLABLE | Soft delete timestamp |

---

### 2. `slots`
Stores scheduled consultation time windows for doctors.

| Column | Data Type | Constraints / Indexes | Description |
|---|---|---|---|
| `id` | `UUID` | Primary Key, `uuid_generate_v4()` | Slot ID |
| `doctorId` | `UUID` | INDEX, FK -> `doctor_profiles(id)` ON DELETE CASCADE | Doctor ID |
| `startsAt` | `TIMESTAMPTZ` | INDEX, NOT NULL | Slot start time |
| `endsAt` | `TIMESTAMPTZ` | NOT NULL | Slot end time |
| `status` | `ENUM` | INDEX, DEFAULT `'AVAILABLE'` | `'AVAILABLE'`, `'BOOKED'`, `'BLOCKED'` |
| `createdAt` | `TIMESTAMPTZ` | DEFAULT `now()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | DEFAULT `now()` | Update timestamp |

**Check Constraints**:
- `CHK_slots_starts_before_ends`: `CHECK ("startsAt" < "endsAt")`

---

### 3. `appointments`
Stores appointment bookings between patients and slots.

| Column | Data Type | Constraints / Indexes | Description |
|---|---|---|---|
| `id` | `UUID` | Primary Key, `uuid_generate_v4()` | Appointment ID |
| `patientId` | `UUID` | INDEX, NOT NULL | Patient User reference |
| `slotId` | `UUID` | FK -> `slots(id)` ON DELETE CASCADE, UNIQUE | Booked Slot reference |
| `status` | `ENUM` | INDEX, DEFAULT `'SCHEDULED'` | `'SCHEDULED'`, `'CANCELLED'`, `'COMPLETED'` |
| `reason` | `TEXT` | NULLABLE | Patient symptoms or visit reason |
| `createdAt` | `TIMESTAMPTZ` | DEFAULT `now()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | DEFAULT `now()` | Update timestamp |
| `deletedAt` | `TIMESTAMPTZ` | NULLABLE | Soft delete timestamp |
