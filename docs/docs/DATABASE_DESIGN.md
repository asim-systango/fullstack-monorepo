# Database Design & Repository Architecture Specification

## Overview

The **Hospital Appointment System** database architecture is designed using PostgreSQL and TypeORM, following domain isolation, explicit repository encapsulation, and soft delete patterns.

---

## Database Tables & Schema Specs

### 1. `doctor_profiles`

Stores extended doctor information linked to the authentication `users` table.

| Column             | Type            | Constraints                       | Description                         |
| ------------------ | --------------- | --------------------------------- | ----------------------------------- |
| `id`               | `uuid`          | PK, default `gen_random_uuid()`   | Primary Key                         |
| `user_id`          | `uuid`          | FK (`users.id`), UNIQUE, NOT NULL | Direct link to user record          |
| `first_name`       | `varchar(100)`  | NOT NULL                          | Doctor first name                   |
| `last_name`        | `varchar(100)`  | NOT NULL                          | Doctor last name                    |
| `specialization`   | `varchar(100)`  | NOT NULL, INDEX                   | Medical specialty (e.g. Cardiology) |
| `qualification`    | `varchar(255)`  | NOT NULL                          | Academic degrees/certifications     |
| `experience_years` | `integer`       | NOT NULL, DEFAULT 0               | Years of clinical practice          |
| `consultation_fee` | `numeric(10,2)` | NOT NULL                          | Consultation fee in INR             |
| `biography`        | `text`          | NULLABLE                          | Professional bio                    |
| `profile_image`    | `varchar(500)`  | NULLABLE                          | Profile picture URL                 |
| `is_active`        | `boolean`       | DEFAULT true                      | Account status flag                 |
| `created_at`       | `timestamp`     | DEFAULT `now()`                   | Record creation timestamp           |
| `updated_at`       | `timestamp`     | DEFAULT `now()`                   | Record update timestamp             |
| `deleted_at`       | `timestamp`     | NULLABLE                          | Soft delete timestamp               |

**Indexes & Constraints**:

- `IDX_DOCTOR_SPECIALIZATION` on `specialization`
- `UQ_DOCTOR_USER_ID` unique constraint on `user_id`

---

### 2. `slots`

Represents 30-minute consultation availability windows for doctors.

| Column       | Type                       | Constraints                            | Description                              |
| ------------ | -------------------------- | -------------------------------------- | ---------------------------------------- |
| `id`         | `uuid`                     | PK, default `gen_random_uuid()`        | Primary Key                              |
| `doctor_id`  | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL    | Doctor reference                         |
| `starts_at`  | `timestamp with time zone` | NOT NULL, INDEX                        | Consultation window start                |
| `ends_at`    | `timestamp with time zone` | NOT NULL                               | Consultation window end                  |
| `status`     | `varchar(20)`              | NOT NULL, DEFAULT `'AVAILABLE'`, INDEX | Status: `AVAILABLE`, `BOOKED`, `BLOCKED` |
| `created_at` | `timestamp`                | DEFAULT `now()`                        | Creation timestamp                       |
| `updated_at` | `timestamp`                | DEFAULT `now()`                        | Update timestamp                         |

**Indexes & Constraints**:

- `IDX_SLOTS_DOCTOR_ID` on `doctor_id`
- `IDX_SLOTS_STARTS_AT` on `starts_at`
- `IDX_SLOTS_STATUS` on `status`
- `CHK_SLOTS_TIME_ORDER` check constraint (`starts_at < ends_at`)

---

### 3. `appointments`

Represents patient bookings tied to specific consultation slots.

| Column       | Type          | Constraints                            | Description                                   |
| ------------ | ------------- | -------------------------------------- | --------------------------------------------- |
| `id`         | `uuid`        | PK, default `gen_random_uuid()`        | Primary Key                                   |
| `patient_id` | `uuid`        | FK (`users.id`), NOT NULL              | Patient reference                             |
| `slot_id`    | `uuid`        | FK (`slots.id`), UNIQUE, NOT NULL      | Slot reference                                |
| `status`     | `varchar(20)` | NOT NULL, DEFAULT `'SCHEDULED'`, INDEX | Status: `SCHEDULED`, `CANCELLED`, `COMPLETED` |
| `reason`     | `text`        | NULLABLE                               | Reason for medical visit                      |
| `created_at` | `timestamp`   | DEFAULT `now()`                        | Creation timestamp                            |
| `updated_at` | `timestamp`   | DEFAULT `now()`                        | Update timestamp                              |
| `deleted_at` | `timestamp`   | NULLABLE                               | Soft delete timestamp                         |

**Indexes & Constraints**:

- `IDX_APPOINTMENTS_PATIENT_ID` on `patient_id`
- `IDX_APPOINTMENTS_STATUS` on `status`
- `UQ_APPOINTMENTS_SLOT_ID` unique constraint on `slot_id`

---

### 4. `prescriptions`

Contains medical prescriptions generated by doctors for completed appointments.

| Column           | Type        | Constraints                              | Description                  |
| ---------------- | ----------- | ---------------------------------------- | ---------------------------- |
| `id`             | `uuid`      | PK, default `gen_random_uuid()`          | Primary Key                  |
| `appointment_id` | `uuid`      | FK (`appointments.id`), UNIQUE, NOT NULL | Appointment reference        |
| `medicines`      | `jsonb`     | NOT NULL                                 | Structured medicine array    |
| `instructions`   | `text`      | NULLABLE                                 | Special patient instructions |
| `created_at`     | `timestamp` | DEFAULT `now()`                          | Creation timestamp           |
| `updated_at`     | `timestamp` | DEFAULT `now()`                          | Update timestamp             |

---

### 5. `medical_notes`

Clinical progress notes attached to appointments.

| Column           | Type        | Constraints                         | Description                   |
| ---------------- | ----------- | ----------------------------------- | ----------------------------- |
| `id`             | `uuid`      | PK, default `gen_random_uuid()`     | Primary Key                   |
| `appointment_id` | `uuid`      | FK (`appointments.id`), NOT NULL    | Appointment reference         |
| `doctor_id`      | `uuid`      | FK (`doctor_profiles.id`), NOT NULL | Doctor reference              |
| `notes`          | `text`      | NOT NULL                            | Clinical observations & notes |
| `created_at`     | `timestamp` | DEFAULT `now()`                     | Creation timestamp            |
| `updated_at`     | `timestamp` | DEFAULT `now()`                     | Update timestamp              |

---

## Concurrency & Transaction Safety (Day 4)

### 1. Pessimistic Write Locking (`pessimistic_write`)

To eliminate double-booking under concurrent HTTP requests, `AppointmentService.create` executes within a database transaction managed by TypeORM `QueryRunner`:

```sql
-- Executed inside QueryRunner transaction block:
BEGIN;
SELECT * FROM slots WHERE id = 'slot-uuid' FOR UPDATE;
-- Verify status = 'AVAILABLE' and startsAt > NOW()
UPDATE slots SET status = 'BOOKED' WHERE id = 'slot-uuid';
INSERT INTO appointments (patient_id, slot_id, status, reason) VALUES (...);
COMMIT;
```

If a second concurrent request attempts to book the same `slot-uuid`, PostgreSQL holds the second transaction at `SELECT ... FOR UPDATE` until the first transaction commits or rolls back. Once released, the second transaction sees `status = 'BOOKED'` and throws a `409 Conflict` exception.

### 2. State Machine Transitions

#### Slot Status Lifecycle:

- `AVAILABLE` -> `BOOKED` (On successful appointment booking transaction)
- `AVAILABLE` -> `BLOCKED` (On doctor schedule modification)
- `BLOCKED` -> `AVAILABLE` (On doctor unblocking slot)
- `BOOKED` -> `AVAILABLE` (On appointment cancellation transaction)

#### Appointment Status Lifecycle:

- `SCHEDULED` -> `COMPLETED` (On consultation completion via `POST /appointments/:id/complete`)
- `SCHEDULED` -> `CANCELLED` (On patient or admin cancellation, triggers soft-delete `deletedAt = NOW()`)

---

### 3. Clinical Completion Transaction & Privacy Controls (Day 5)

#### Transactional Completion Flow:

When `POST /appointments/:id/complete` is executed:

1. `SELECT * FROM appointments WHERE id = :id FOR UPDATE` inside a `QueryRunner` transaction.
2. Validates appointment status is `SCHEDULED`.
3. Verifies doctor ownership (`slot.doctorId === doctorProfile.id` for Doctor role).
4. Updates `appointment.status = 'COMPLETED'`.
5. Atomically inserts into `prescriptions` table if medicines array is provided.
6. Atomically inserts into `medical_notes` table if notes text is provided.
7. Commits transaction and returns populated appointment.

#### Role-Based Data Privacy Scoping:

- **Patient Queries**: Internal medical notes are dynamically stripped (`appointment.medicalNotes = []`) before serialization to preserve doctor notes confidentiality.
- **Doctor Queries**: Scoped strictly to slots owned by the requesting doctor.
- **Admin Queries**: Unrestricted query builder with `q` search parameter across doctors, patients, and visit reasons.
