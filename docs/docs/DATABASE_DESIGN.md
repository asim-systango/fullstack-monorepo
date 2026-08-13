# PulseCare — Database Architecture

## Overview

This document describes the **actual production database schema** for the PulseCare Hospital Appointment System.

> **Note:** An earlier enterprise multi-hospital schema existed during development but was removed (migration `1785932184730-DropUnusedTables`). This document only covers tables that exist in the live database.

---

## Core Design Philosophy

### One `users` Table, Three Profile Tables

Every person who logs into PulseCare is stored in the `users` table. The `role` column (`ADMIN | DOCTOR | PATIENT`) determines who they are. Each role then has a **dedicated profile table** for role-specific data:

```
users
  │
  ├──1:1──▶ hospital_admins    (role='ADMIN')   → hospital name, department, job title
  ├──1:1──▶ doctor_profiles    (role='DOCTOR')  → specialization, fees, documents
  └──1:1──▶ patient_profiles   (role='PATIENT') → blood group, DOB, allergies
```

**Why separate profile tables?**

- `users` stays lean — only auth fields (email, password hash, JWT tokens)
- Each role can evolve independently without affecting other roles
- Easy to explain: just like an org chart — one employee record, different job cards

### Which App Owns Which Table?

| Table              | Lives in       | Reason                                                   |
| ------------------ | -------------- | -------------------------------------------------------- |
| `users`            | `api-gateway`  | Auth + JWT token management lives there                  |
| `hospital_admins`  | `api-gateway`  | Admin profile is extension of `users` (same DB boundary) |
| `doctor_profiles`  | `api` (domain) | Doctor data drives scheduling, slots, fees               |
| `patient_profiles` | `api` (domain) | Patient health data belongs to domain layer              |
| `slots`            | `api` (domain) | Doctor scheduling                                        |
| `appointments`     | `api` (domain) | Core booking engine                                      |
| `prescriptions`    | `api` (domain) | Clinical output                                          |
| `medical_notes`    | `api` (domain) | Clinical output                                          |

---

## Tables & Schema Reference

### 1. Identity & Auth — `api-gateway` schema

#### `users`

Core identity table. **Every role (ADMIN, DOCTOR, PATIENT) has a row here.**

| Column                 | Type           | Constraints                   | Description                  |
| :--------------------- | :------------- | :---------------------------- | :--------------------------- |
| `id`                   | `uuid`         | PK, `uuid_generate_v4()`      | Primary key                  |
| `email`                | `varchar(150)` | UNIQUE, NOT NULL              | Login email                  |
| `password_hash`        | `varchar(255)` | NOT NULL                      | bcrypt hashed password       |
| `first_name`           | `varchar(50)`  | NULLABLE                      | Given name                   |
| `last_name`            | `varchar(50)`  | NULLABLE                      | Family name                  |
| `name`                 | `varchar(120)` | NULLABLE                      | Display name                 |
| `phone`                | `varchar(20)`  | UNIQUE, NULLABLE              | Contact phone                |
| `role`                 | `varchar(20)`  | NOT NULL, DEFAULT `'PATIENT'` | `ADMIN \| DOCTOR \| PATIENT` |
| `is_active`            | `boolean`      | DEFAULT true                  | Account status               |
| `email_verified`       | `boolean`      | DEFAULT false                 | Email verification flag      |
| `hashed_refresh_token` | `text`         | NULLABLE                      | JWT refresh token (hashed)   |
| `created_at`           | `timestamptz`  | DEFAULT `now()`               | Created timestamp            |
| `updated_at`           | `timestamptz`  | DEFAULT `now()`               | Updated timestamp            |
| `deleted_at`           | `timestamptz`  | NULLABLE                      | Soft-delete timestamp        |

---

#### `hospital_admins`

Extended profile for users with `role = 'ADMIN'`. One row per admin user.

| Column          | Type           | Constraints             | Description                            |
| :-------------- | :------------- | :---------------------- | :------------------------------------- |
| `id`            | `uuid`         | PK                      | Primary key                            |
| `userId`        | `uuid`         | FK → `users.id`, UNIQUE | Linked admin user                      |
| `hospital_name` | `varchar(150)` | NULLABLE                | Name of the hospital managed           |
| `department`    | `varchar(100)` | NULLABLE                | Department (e.g. Operations)           |
| `job_title`     | `varchar(100)` | NULLABLE                | Job title (e.g. Chief Medical Officer) |
| `office_phone`  | `varchar(20)`  | NULLABLE                | Direct office phone                    |
| `address`       | `varchar(255)` | NULLABLE                | Hospital address                       |
| `profile_image` | `varchar(255)` | NULLABLE                | Profile photo path                     |
| `created_at`    | `timestamptz`  | DEFAULT `now()`         | Created timestamp                      |
| `updated_at`    | `timestamptz`  | DEFAULT `now()`         | Updated timestamp                      |

> **FK constraint:** `hospital_admins.userId → users.id ON DELETE CASCADE`

---

### 2. Doctor Domain — `api` schema

#### `doctor_profiles`

Professional profile for users with `role = 'DOCTOR'`. One row per doctor.

| Column            | Type            | Constraints          | Description                       |
| :---------------- | :-------------- | :------------------- | :-------------------------------- |
| `id`              | `uuid`          | PK                   | Primary key                       |
| `userId`          | `uuid`          | UNIQUE, NOT NULL     | Linked user (`users.id`)          |
| `firstName`       | `varchar(50)`   | NOT NULL             | Doctor's first name               |
| `lastName`        | `varchar(50)`   | NOT NULL             | Doctor's last name                |
| `specialization`  | `varchar(100)`  | NOT NULL, INDEX      | Medical specialty                 |
| `qualification`   | `varchar(100)`  | NOT NULL             | Degrees (MBBS, MD, etc.)          |
| `experienceYears` | `integer`       | DEFAULT 0            | Years of practice                 |
| `consultationFee` | `decimal(10,2)` | DEFAULT 0            | Doctor fee per session            |
| `hospitalCharge`  | `decimal(10,2)` | DEFAULT 0            | Hospital overhead charge          |
| `biography`       | `text`          | NULLABLE             | Professional summary              |
| `profileImage`    | `varchar(255)`  | NULLABLE             | Photo path                        |
| `documents`       | `jsonb`         | DEFAULT `[]`         | Credential documents array        |
| `isActive`        | `boolean`       | DEFAULT true         | Active practice flag              |
| `approvalStatus`  | `varchar(20)`   | DEFAULT `'APPROVED'` | `PENDING \| APPROVED \| REJECTED` |
| `deleted_at`      | `timestamptz`   | NULLABLE             | Soft-delete timestamp             |
| `created_at`      | `timestamptz`   | DEFAULT `now()`      | Created timestamp                 |
| `updated_at`      | `timestamptz`   | DEFAULT `now()`      | Updated timestamp                 |

---

#### `patient_profiles`

Extended health profile for users with `role = 'PATIENT'`. One row per patient.

| Column              | Type           | Constraints      | Description                         |
| :------------------ | :------------- | :--------------- | :---------------------------------- |
| `id`                | `uuid`         | PK               | Primary key                         |
| `userId`            | `uuid`         | UNIQUE, NOT NULL | Linked user (`users.id`)            |
| `firstName`         | `varchar(50)`  | NULLABLE         | Patient first name                  |
| `lastName`          | `varchar(50)`  | NULLABLE         | Patient last name                   |
| `date_of_birth`     | `date`         | NULLABLE         | Date of birth                       |
| `gender`            | `varchar(10)`  | NULLABLE         | `MALE \| FEMALE \| OTHER`           |
| `blood_group`       | `varchar(5)`   | NULLABLE         | e.g. `A+`, `O-`                     |
| `emergency_contact` | `varchar(20)`  | NULLABLE         | Emergency phone number              |
| `allergies`         | `text`         | NULLABLE         | Known allergies                     |
| `medical_history`   | `text`         | NULLABLE         | Chronic conditions, past procedures |
| `profile_image`     | `varchar(255)` | NULLABLE         | Photo path                          |
| `created_at`        | `timestamptz`  | DEFAULT `now()`  | Created timestamp                   |
| `updated_at`        | `timestamptz`  | DEFAULT `now()`  | Updated timestamp                   |

---

### 3. Scheduling — `api` schema

#### `slots`

Concrete consultation time windows created by a doctor.

| Column       | Type          | Constraints                                 | Description                      |
| :----------- | :------------ | :------------------------------------------ | :------------------------------- |
| `id`         | `uuid`        | PK                                          | Primary key                      |
| `doctorId`   | `uuid`        | FK → `doctor_profiles.id` ON DELETE CASCADE | Owning doctor                    |
| `starts_at`  | `timestamptz` | NOT NULL, INDEX                             | Slot start time                  |
| `ends_at`    | `timestamptz` | NOT NULL                                    | Slot end time                    |
| `status`     | `enum`        | DEFAULT `'AVAILABLE'`                       | `AVAILABLE \| BOOKED \| BLOCKED` |
| `created_at` | `timestamptz` | DEFAULT `now()`                             | Created timestamp                |
| `updated_at` | `timestamptz` | DEFAULT `now()`                             | Updated timestamp                |

> **Check constraint:** `starts_at < ends_at`

---

### 4. Appointments — `api` schema

#### `appointments`

Core booking record. Links a **patient user** to a **slot**.

> **Note:** `patientId` references `users.id` directly (not `patient_profiles.id`). This keeps booking fast without requiring an existing patient profile row.

| Column            | Type            | Constraints                               | Description                           |
| :---------------- | :-------------- | :---------------------------------------- | :------------------------------------ |
| `id`              | `uuid`          | PK                                        | Primary key                           |
| `patientId`       | `uuid`          | INDEX, NOT NULL                           | → `users.id` (role=PATIENT)           |
| `slotId`          | `uuid`          | UNIQUE, FK → `slots.id` ON DELETE CASCADE | Reserved slot                         |
| `status`          | `enum`          | DEFAULT `'SCHEDULED'`                     | `SCHEDULED \| CANCELLED \| COMPLETED` |
| `type`            | `varchar(20)`   | DEFAULT `'IN_PERSON'`                     | `IN_PERSON \| TELECONSULT`            |
| `reason`          | `text`          | NULLABLE                                  | Reason for visit                      |
| `consultationFee` | `decimal(10,2)` | DEFAULT 0                                 | Fee at time of booking                |
| `hospitalCharge`  | `decimal(10,2)` | DEFAULT 10                                | Hospital charge at booking            |
| `totalAmount`     | `decimal(10,2)` | DEFAULT 10                                | consultationFee + hospitalCharge      |
| `deleted_at`      | `timestamptz`   | NULLABLE                                  | Soft-delete on cancellation           |
| `created_at`      | `timestamptz`   | DEFAULT `now()`                           | Created timestamp                     |
| `updated_at`      | `timestamptz`   | DEFAULT `now()`                           | Updated timestamp                     |

---

### 5. Clinical Records — `api` schema

#### `prescriptions`

Medication prescription attached to a completed appointment.

| Column          | Type          | Constraints                                      | Description                                    |
| :-------------- | :------------ | :----------------------------------------------- | :--------------------------------------------- |
| `id`            | `uuid`        | PK                                               | Primary key                                    |
| `appointmentId` | `uuid`        | UNIQUE, FK → `appointments.id` ON DELETE CASCADE | Linked appointment                             |
| `medicines`     | `jsonb`       | DEFAULT `[]`                                     | Array of `{name, dosage, frequency, duration}` |
| `instructions`  | `text`        | NULLABLE                                         | Additional instructions                        |
| `created_at`    | `timestamptz` | DEFAULT `now()`                                  | Created timestamp                              |
| `updated_at`    | `timestamptz` | DEFAULT `now()`                                  | Updated timestamp                              |

---

#### `medical_notes`

Doctor's clinical notes written during a consultation.

| Column          | Type          | Constraints                                        | Description              |
| :-------------- | :------------ | :------------------------------------------------- | :----------------------- |
| `id`            | `uuid`        | PK                                                 | Primary key              |
| `appointmentId` | `uuid`        | INDEX, FK → `appointments.id` ON DELETE CASCADE    | Linked appointment       |
| `doctorId`      | `uuid`        | INDEX, FK → `doctor_profiles.id` ON DELETE CASCADE | Author doctor            |
| `notes`         | `text`        | NOT NULL                                           | Free-text clinical notes |
| `created_at`    | `timestamptz` | DEFAULT `now()`                                    | Created timestamp        |

---

## Migration History

Both apps share one PostgreSQL database but use **separate migration ledger tables** to avoid conflicts.

| Ledger Table     | App           | Migrations                                                                                                                                                          |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `migrations`     | `api-gateway` | `InitUsers`, `AddAvatarUrlToUsers`, `AddUserFields`, `AddHospitalAdmins`                                                                                            |
| `migrations_api` | `api`         | `CreateDomainTables`, `EnterpriseMultiHospitalSchema`, `AddHospitalChargesAndAppointmentFees`, `AddDoctorDocumentsColumn`, `DropUnusedTables`, `AddPatientProfiles` |

---

## Concurrency Safety

The appointment booking flow uses a **pessimistic write lock** to prevent double-booking:

```sql
BEGIN;
-- Lock the slot so no other transaction can grab it simultaneously
SELECT id, status FROM slots WHERE id = $slotId AND status = 'AVAILABLE' FOR UPDATE;

-- If available: create appointment and update slot
INSERT INTO appointments (patientId, slotId, status, ...) VALUES (...);
UPDATE slots SET status = 'BOOKED' WHERE id = $slotId;

COMMIT;
```

If two patients try to book the same slot at the same time, only one transaction wins — the other gets a `409 Conflict`.

---

## Indexing Strategy

| Index                             | Table              | Column(s)        | Purpose                 |
| :-------------------------------- | :----------------- | :--------------- | :---------------------- |
| `UQ_users_email`                  | `users`            | `email`          | Fast auth lookup        |
| `UQ_doctor_profiles_userId`       | `doctor_profiles`  | `userId`         | 1:1 profile lookup      |
| `IDX_doctor_specialization`       | `doctor_profiles`  | `specialization` | Filter by specialty     |
| `UQ_patient_profiles_userId`      | `patient_profiles` | `userId`         | 1:1 profile lookup      |
| `UQ_hospital_admins_userId`       | `hospital_admins`  | `userId`         | 1:1 profile lookup      |
| `IDX_slots_doctorId`              | `slots`            | `doctorId`       | Fetch doctor's slots    |
| `IDX_slots_starts_at`             | `slots`            | `starts_at`      | Date-range slot queries |
| `IDX_slots_status`                | `slots`            | `status`         | Filter available slots  |
| `IDX_appointments_patientId`      | `appointments`     | `patientId`      | Patient's appointments  |
| `IDX_appointments_status`         | `appointments`     | `status`         | Status filtering        |
| `IDX_medical_notes_appointmentId` | `medical_notes`    | `appointmentId`  | Notes per appointment   |
| `IDX_medical_notes_doctorId`      | `medical_notes`    | `doctorId`       | Notes by doctor         |
