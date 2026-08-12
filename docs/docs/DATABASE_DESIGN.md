# Enterprise Multi-Hospital Management System (HMS) - Database Architecture Specification

## Executive Overview & Architectural Philosophy

This document defines the production database architecture for an enterprise-grade **Multi-Tenant Hospital Management System (HMS)**. Designed by senior database architects, this schema balances scalability, strict data isolation, clinical workflow integrity, financial auditing, and zero-downtime extensibility.

The system supports multi-tenant operations where **Hospitals** operate as isolated tenant environments containing **Branches**, **Departments**, **Physicians**, **Clinical EHR**, **IPD Wards & Beds**, **Financial Invoicing**, **Insurance Claims**, and **Governance Audit Logs**.

---

## Architectural Principles (SOLID & Relational Engineering)

### 1. Single Responsibility Principle (SRP)

- **Identity Isolation**: The `users` table handles authentication credentials (email, password hash, status). Specialized profiles (`patient_profiles`, `doctor_profiles`, `staff_profiles`) store domain-specific attributes.
- **Transactional Decoupling**: Master financial records (`invoices`) and clinical orders (`prescriptions`) are decoupled from line-item breakdowns (`invoice_items`, `prescription_items`).
- **Encounter Context**: Clinical actions occur within explicit clinical `encounters`, isolating outpatient visits from inpatient stays.

### 2. Open/Closed Principle (OCP)

- **JSONB Extensibility**: Operational entities include structured `JSONB` columns (`metadata`, `medical_history`, `audit_trail`) for hospital-specific parameters without requiring DDL schema alterations.
- **Audit-First Design**: Append-only audit logs (`audit_logs`) capture state changes without mutating baseline table constraints.

### 3. Liskov Substitution & Interface Segregation (LSP / ISP)

- **Role-Segregated Profiles**: Access controls map to explicit user roles (`SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `BILLING_ADMIN`, `PATIENT`).
- **Multi-Department Affiliations**: Doctors can be affiliated with multiple hospital departments via the junction relation `doctor_departments`.

### 4. Dependency Inversion Principle (DIP)

- Abstract UUID primary keys (`gen_random_uuid()`) decouple identity from auto-incrementing database sequences, allowing safe distributed sharding and offline UUID generation.

---

## Multi-Tenant Organization Hierarchy & ERD

```
                  ┌────────────────────────┐
                  │       hospitals        │ (Tenant Root)
                  └───────────┬────────────┘
                              │ 1:N
                  ┌───────────┴────────────┐
                  │   hospital_branches    │
                  └───────────┬────────────┘
                              │ 1:N
                  ┌───────────┴────────────┐
                  │      departments       │
                  └───────────┬────────────┘
                              │ 1:N
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐
│ doctor_profiles │  │ staff_profiles  │  │ patient_profiles│
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │ 1:N                │                    │ 1:N
┌────────┴────────┐           │           ┌────────┴────────┐
│     slots       │           │           │  appointments   │
└────────┬────────┘           │           └────────┬────────┘
         │ 1:1                │                    │ 1:1
┌────────┴────────┐           │           ┌────────┴────────┐
│  appointments   │───────────┼───────────│   encounters    │
└─────────────────┘           │           └────────┬────────┘
                              │                    │ 1:N
                              │           ┌────────┴────────┐
                              │           │ prescriptions / │
                              │           │ medical_notes / │
                              │           │  invoices       │
                              │           └─────────────────┘
```

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    HOSPITALS ||--o{ HOSPITAL_BRANCHES : operates
    HOSPITALS ||--o{ DEPARTMENTS : contains
    HOSPITALS ||--o{ USER_ROLES : grants
    HOSPITALS ||--o{ PATIENT_PROFILES : registers
    HOSPITALS ||--o{ AUDIT_LOGS : tracks

    HOSPITAL_BRANCHES ||--o{ WARDS : houses
    DEPARTMENTS ||--o{ DOCTOR_DEPARTMENTS : employs
    DOCTOR_PROFILES ||--o{ DOCTOR_DEPARTMENTS : belongs_to

    USERS ||--o{ USER_ROLES : holds
    USERS ||--o1 PATIENT_PROFILES : has
    USERS ||--o1 DOCTOR_PROFILES : has
    USERS ||--o1 STAFF_PROFILES : has

    DOCTOR_PROFILES ||--o{ DOCTOR_SCHEDULES : defines
    DOCTOR_PROFILES ||--o{ SLOTS : provisions
    PATIENT_PROFILES ||--o{ APPOINTMENTS : books
    SLOTS ||--o1 APPOINTMENTS : reserves

    PATIENT_PROFILES ||--o{ ADMISSIONS : admitted_in
    BEDS ||--o{ ADMISSIONS : allocated_to
    WARDS ||--o{ BEDS : contains

    APPOINTMENTS ||--o1 ENCOUNTERS : generates
    ADMISSIONS ||--o1 ENCOUNTERS : generates

    ENCOUNTERS ||--o{ MEDICAL_NOTES : records
    ENCOUNTERS ||--o{ PRESCRIPTIONS : prescribes
    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : items

    ENCOUNTERS ||--o1 INVOICES : bills
    INVOICES ||--o{ INVOICE_ITEMS : lists
    INVOICES ||--o{ PAYMENTS : accepts
    INVOICES ||--o1 INSURANCE_CLAIMS : files
```

---

## Database Tables & Schema Specifications

### 1. Identity & Access Control (IAM) Context

#### `hospitals`

Tenant root record representing a healthcare organization/hospital system.

| Column           | Type                       | Constraints                  | Description                                              |
| :--------------- | :------------------------- | :--------------------------- | :------------------------------------------------------- |
| `id`             | `uuid`                     | PK, `gen_random_uuid()`      | Primary Key                                              |
| `code`           | `varchar(20)`              | UNIQUE, NOT NULL             | Unique hospital code (e.g. `HOSP-001`)                   |
| `name`           | `varchar(200)`             | NOT NULL                     | Official legal name of hospital                          |
| `license_number` | `varchar(100)`             | UNIQUE, NOT NULL             | Government regulatory license                            |
| `contact_email`  | `varchar(150)`             | NOT NULL                     | Primary contact email                                    |
| `contact_phone`  | `varchar(30)`              | NOT NULL                     | Primary contact phone number                             |
| `address`        | `jsonb`                    | NOT NULL                     | Structured address `{street, city, state, zip, country}` |
| `status`         | `varchar(20)`              | NOT NULL, DEFAULT `'ACTIVE'` | Status: `ACTIVE`, `SUSPENDED`, `INACTIVE`                |
| `settings`       | `jsonb`                    | NOT NULL, DEFAULT `'{}'`     | Tenant configuration (tz, currency, features)            |
| `created_at`     | `timestamp with time zone` | DEFAULT `now()`              | Record creation timestamp                                |
| `updated_at`     | `timestamp with time zone` | DEFAULT `now()`              | Record update timestamp                                  |
| `deleted_at`     | `timestamp with time zone` | NULLABLE                     | Soft delete timestamp                                    |

#### `hospital_branches`

Physical healthcare facility branches under a main hospital tenant.

| Column          | Type                       | Constraints                   | Description                         |
| :-------------- | :------------------------- | :---------------------------- | :---------------------------------- |
| `id`            | `uuid`                     | PK, `gen_random_uuid()`       | Primary Key                         |
| `hospital_id`   | `uuid`                     | FK (`hospitals.id`), NOT NULL | Parent hospital tenant              |
| `branch_code`   | `varchar(20)`              | NOT NULL                      | Branch identifier code              |
| `name`          | `varchar(200)`             | NOT NULL                      | Branch name (e.g., Downtown Branch) |
| `address`       | `jsonb`                    | NOT NULL                      | Physical address breakdown          |
| `contact_phone` | `varchar(30)`              | NOT NULL                      | Branch contact line                 |
| `is_main`       | `boolean`                  | DEFAULT false                 | Primary headquarters flag           |
| `created_at`    | `timestamp with time zone` | DEFAULT `now()`               | Record creation timestamp           |
| `updated_at`    | `timestamp with time zone` | DEFAULT `now()`               | Record update timestamp             |
| `deleted_at`    | `timestamp with time zone` | NULLABLE                      | Soft delete timestamp               |

#### `users`

Core identity table storing user credentials for all roles across the application.

| Column              | Type                       | Constraints             | Description                     |
| :------------------ | :------------------------- | :---------------------- | :------------------------------ |
| `id`                | `uuid`                     | PK, `gen_random_uuid()` | Primary Key                     |
| `email`             | `varchar(150)`             | UNIQUE, NOT NULL        | Primary email address           |
| `password_hash`     | `varchar(255)`             | NOT NULL                | Argon2id / bcrypt password hash |
| `first_name`        | `varchar(100)`             | NOT NULL                | User given name                 |
| `last_name`         | `varchar(100)`             | NOT NULL                | User family name                |
| `phone_number`      | `varchar(30)`              | NULLABLE                | Contact telephone               |
| `is_active`         | `boolean`                  | DEFAULT true            | Global active status flag       |
| `email_verified_at` | `timestamp with time zone` | NULLABLE                | Verification timestamp          |
| `created_at`        | `timestamp with time zone` | DEFAULT `now()`         | Record creation timestamp       |
| `updated_at`        | `timestamp with time zone` | DEFAULT `now()`         | Record update timestamp         |
| `deleted_at`        | `timestamp with time zone` | NULLABLE                | Soft delete timestamp           |

#### `user_roles`

Multi-hospital Role-Based Access Control (RBAC) mapping users to tenant roles.

| Column        | Type                       | Constraints                   | Description                                                                                                |
| :------------ | :------------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `id`          | `uuid`                     | PK, `gen_random_uuid()`       | Primary Key                                                                                                |
| `user_id`     | `uuid`                     | FK (`users.id`), NOT NULL     | User reference                                                                                             |
| `hospital_id` | `uuid`                     | FK (`hospitals.id`), NULLABLE | Hospital scope (NULL for SUPER_ADMIN)                                                                      |
| `role`        | `varchar(30)`              | NOT NULL                      | Role enum (`SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `BILLING_ADMIN`, `PATIENT`) |
| `created_at`  | `timestamp with time zone` | DEFAULT `now()`               | Grant timestamp                                                                                            |

#### `patient_profiles`

Patient demographic, clinical baseline, and Medical Record Number (MRN) profile.

| Column              | Type                       | Constraints                       | Description                                   |
| :------------------ | :------------------------- | :-------------------------------- | :-------------------------------------------- |
| `id`                | `uuid`                     | PK, `gen_random_uuid()`           | Primary Key                                   |
| `user_id`           | `uuid`                     | FK (`users.id`), UNIQUE, NOT NULL | Linked IAM user account                       |
| `hospital_id`       | `uuid`                     | FK (`hospitals.id`), NOT NULL     | Primary registered hospital                   |
| `mrn`               | `varchar(50)`              | UNIQUE, NOT NULL                  | Medical Record Number                         |
| `date_of_birth`     | `date`                     | NOT NULL                          | Date of birth                                 |
| `gender`            | `varchar(20)`              | NOT NULL                          | Gender (`MALE`, `FEMALE`, `OTHER`)            |
| `blood_group`       | `varchar(10)`              | NULLABLE                          | Blood group (e.g. `O+`, `A-`)                 |
| `emergency_contact` | `jsonb`                    | NOT NULL                          | Name, relation, phone details                 |
| `medical_history`   | `jsonb`                    | DEFAULT `'{}'`                    | Chronic conditions, allergies, past surgeries |
| `created_at`        | `timestamp with time zone` | DEFAULT `now()`                   | Record creation timestamp                     |
| `updated_at`        | `timestamp with time zone` | DEFAULT `now()`                   | Record update timestamp                       |
| `deleted_at`        | `timestamp with time zone` | NULLABLE                          | Soft delete timestamp                         |

---

### 2. Organization & Staffing Context

#### `departments`

Hospital clinical & administrative departments (e.g., Cardiology, Neurology, Billing).

| Column           | Type                       | Constraints                   | Description                   |
| :--------------- | :------------------------- | :---------------------------- | :---------------------------- |
| `id`             | `uuid`                     | PK, `gen_random_uuid()`       | Primary Key                   |
| `hospital_id`    | `uuid`                     | FK (`hospitals.id`), NOT NULL | Tenant hospital               |
| `code`           | `varchar(20)`              | NOT NULL                      | Department code (e.g. `CARD`) |
| `name`           | `varchar(150)`             | NOT NULL                      | Department name               |
| `head_doctor_id` | `uuid`                     | NULLABLE                      | Doctor leading the department |
| `location_floor` | `varchar(50)`              | NULLABLE                      | Building floor/location       |
| `created_at`     | `timestamp with time zone` | DEFAULT `now()`               | Record creation timestamp     |
| `updated_at`     | `timestamp with time zone` | DEFAULT `now()`               | Record update timestamp       |

#### `doctor_profiles`

Professional credentials and consultation settings for physicians.

| Column             | Type                       | Constraints                       | Description                    |
| :----------------- | :------------------------- | :-------------------------------- | :----------------------------- |
| `id`               | `uuid`                     | PK, `gen_random_uuid()`           | Primary Key                    |
| `user_id`          | `uuid`                     | FK (`users.id`), UNIQUE, NOT NULL | Linked IAM user account        |
| `hospital_id`      | `uuid`                     | FK (`hospitals.id`), NOT NULL     | Primary hospital affiliation   |
| `medical_license`  | `varchar(100)`             | UNIQUE, NOT NULL                  | Medical practitioner license   |
| `specialization`   | `varchar(100)`             | NOT NULL, INDEX                   | Primary medical specialty      |
| `qualification`    | `varchar(255)`             | NOT NULL                          | Degrees (e.g., MD, MBBS, FACS) |
| `experience_years` | `integer`                  | DEFAULT 0                         | Years of clinical practice     |
| `consultation_fee` | `numeric(10,2)`            | NOT NULL                          | Default consultation fee       |
| `biography`        | `text`                     | NULLABLE                          | Professional summary           |
| `profile_image`    | `varchar(500)`             | NULLABLE                          | Profile photo URL              |
| `is_active`        | `boolean`                  | DEFAULT true                      | Active practice status         |
| `created_at`       | `timestamp with time zone` | DEFAULT `now()`                   | Record creation timestamp      |
| `updated_at`       | `timestamp with time zone` | DEFAULT `now()`                   | Record update timestamp        |
| `deleted_at`       | `timestamp with time zone` | NULLABLE                          | Soft delete timestamp          |

#### `doctor_departments`

Junction table supporting multi-department doctor affiliations.

| Column          | Type      | Constraints                         | Description                  |
| :-------------- | :-------- | :---------------------------------- | :--------------------------- |
| `doctor_id`     | `uuid`    | FK (`doctor_profiles.id`), NOT NULL | Doctor reference             |
| `department_id` | `uuid`    | FK (`departments.id`), NOT NULL     | Department reference         |
| `is_primary`    | `boolean` | DEFAULT false                       | Primary department indicator |

#### `staff_profiles`

Administrative, nursing, and support staff records.

| Column           | Type                       | Constraints                       | Description                                              |
| :--------------- | :------------------------- | :-------------------------------- | :------------------------------------------------------- |
| `id`             | `uuid`                     | PK, `gen_random_uuid()`           | Primary Key                                              |
| `user_id`        | `uuid`                     | FK (`users.id`), UNIQUE, NOT NULL | Linked user                                              |
| `hospital_id`    | `uuid`                     | FK (`hospitals.id`), NOT NULL     | Hospital tenant                                          |
| `department_id`  | `uuid`                     | FK (`departments.id`), NOT NULL   | Assigned department                                      |
| `staff_type`     | `varchar(30)`              | NOT NULL                          | Type (`NURSE`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECH`) |
| `shift_schedule` | `varchar(50)`              | NULLABLE                          | Working shift (DAY, NIGHT, ROTATING)                     |
| `created_at`     | `timestamp with time zone` | DEFAULT `now()`                   | Record creation timestamp                                |

---

### 3. Outpatient (OPD) & Scheduling Management Context

#### `doctor_schedules`

Weekly recurring schedule template configured by physicians or hospital admins.

| Column               | Type       | Constraints                         | Description                               |
| :------------------- | :--------- | :---------------------------------- | :---------------------------------------- |
| `id`                 | `uuid`     | PK, `gen_random_uuid()`             | Primary Key                               |
| `doctor_id`          | `uuid`     | FK (`doctor_profiles.id`), NOT NULL | Doctor reference                          |
| `day_of_week`        | `smallint` | NOT NULL                            | Day of week (0 = Sunday ... 6 = Saturday) |
| `start_time`         | `time`     | NOT NULL                            | Shift start time                          |
| `end_time`           | `time`     | NOT NULL                            | Shift end time                            |
| `slot_duration_mins` | `integer`  | DEFAULT 30                          | Individual slot duration                  |
| `is_active`          | `boolean`  | DEFAULT true                        | Schedule status                           |

#### `slots`

Concrete consultation time slots generated from doctor schedules.

| Column          | Type                       | Constraints                           | Description                                      |
| :-------------- | :------------------------- | :------------------------------------ | :----------------------------------------------- |
| `id`            | `uuid`                     | PK, `gen_random_uuid()`               | Primary Key                                      |
| `hospital_id`   | `uuid`                     | FK (`hospitals.id`), NOT NULL         | Hospital tenant                                  |
| `branch_id`     | `uuid`                     | FK (`hospital_branches.id`), NOT NULL | Facility branch                                  |
| `doctor_id`     | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL   | Doctor reference                                 |
| `department_id` | `uuid`                     | FK (`departments.id`), NOT NULL       | Department reference                             |
| `starts_at`     | `timestamp with time zone` | NOT NULL, INDEX                       | Consultation window start                        |
| `ends_at`       | `timestamp with time zone` | NOT NULL                              | Consultation window end                          |
| `status`        | `varchar(20)`              | NOT NULL, DEFAULT `'AVAILABLE'`       | Status: `AVAILABLE`, `BOOKED`, `BLOCKED`, `HELD` |
| `created_at`    | `timestamp with time zone` | DEFAULT `now()`                       | Record creation timestamp                        |

#### `appointments`

Outpatient booking records linking patients to consultation slots.

| Column            | Type                       | Constraints                          | Description                                                                               |
| :---------------- | :------------------------- | :----------------------------------- | :---------------------------------------------------------------------------------------- |
| `id`              | `uuid`                     | PK, `gen_random_uuid()`              | Primary Key                                                                               |
| `hospital_id`     | `uuid`                     | FK (`hospitals.id`), NOT NULL        | Tenant hospital                                                                           |
| `patient_id`      | `uuid`                     | FK (`patient_profiles.id`), NOT NULL | Patient reference                                                                         |
| `doctor_id`       | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL  | Doctor reference                                                                          |
| `slot_id`         | `uuid`                     | FK (`slots.id`), UNIQUE, NOT NULL    | Reserved slot reference                                                                   |
| `type`            | `varchar(20)`              | DEFAULT `'IN_PERSON'`                | Type: `IN_PERSON`, `TELECONSULT`                                                          |
| `status`          | `varchar(20)`              | NOT NULL, DEFAULT `'SCHEDULED'`      | Status: `SCHEDULED`, `CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `chief_complaint` | `text`                     | NULLABLE                             | Reason for visit / symptoms                                                               |
| `created_at`      | `timestamp with time zone` | DEFAULT `now()`                      | Record creation timestamp                                                                 |
| `updated_at`      | `timestamp with time zone` | DEFAULT `now()`                      | Record update timestamp                                                                   |
| `deleted_at`      | `timestamp with time zone` | NULLABLE                             | Soft delete timestamp                                                                     |

---

### 4. Clinical EHR & Diagnostics Context

#### `encounters`

Master record for clinical interaction (Outpatient Appointment or Inpatient Admission).

| Column                | Type                       | Constraints                          | Description                                    |
| :-------------------- | :------------------------- | :----------------------------------- | :--------------------------------------------- |
| `id`                  | `uuid`                     | PK, `gen_random_uuid()`              | Primary Key                                    |
| `hospital_id`         | `uuid`                     | FK (`hospitals.id`), NOT NULL        | Tenant hospital                                |
| `patient_id`          | `uuid`                     | FK (`patient_profiles.id`), NOT NULL | Patient reference                              |
| `attending_doctor_id` | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL  | Primary attending physician                    |
| `appointment_id`      | `uuid`                     | FK (`appointments.id`), NULLABLE     | OPD appointment reference                      |
| `admission_id`        | `uuid`                     | FK (`admissions.id`), NULLABLE       | IPD admission reference                        |
| `type`                | `varchar(20)`              | NOT NULL                             | Encounter type: `OPD`, `IPD`, `EMERGENCY`      |
| `start_time`          | `timestamp with time zone` | NOT NULL                             | Encounter start timestamp                      |
| `end_time`            | `timestamp with time zone` | NULLABLE                             | Encounter end timestamp                        |
| `status`              | `varchar(20)`              | DEFAULT `'IN_PROGRESS'`              | Status: `IN_PROGRESS`, `FINISHED`, `CANCELLED` |

#### `medical_notes`

Structured SOAP (Subjective, Objective, Assessment, Plan) clinical progress notes.

| Column            | Type                       | Constraints                         | Description                          |
| :---------------- | :------------------------- | :---------------------------------- | :----------------------------------- |
| `id`              | `uuid`                     | PK, `gen_random_uuid()`             | Primary Key                          |
| `encounter_id`    | `uuid`                     | FK (`encounters.id`), NOT NULL      | Parent clinical encounter            |
| `doctor_id`       | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL | Authoring doctor                     |
| `subjective`      | `text`                     | NOT NULL                            | Patient history & symptoms           |
| `objective`       | `text`                     | NOT NULL                            | Examination vitals & observations    |
| `assessment`      | `text`                     | NOT NULL                            | Diagnostic assessment & ICD-10 codes |
| `plan`            | `text`                     | NOT NULL                            | Treatment plan & recommendations     |
| `confidentiality` | `varchar(20)`              | DEFAULT `'NORMAL'`                  | Access level: `NORMAL`, `RESTRICTED` |
| `created_at`      | `timestamp with time zone` | DEFAULT `now()`                     | Record creation timestamp            |

#### `prescriptions`

Prescription order header generated by physicians.

| Column                 | Type                       | Constraints                          | Description                  |
| :--------------------- | :------------------------- | :----------------------------------- | :--------------------------- |
| `id`                   | `uuid`                     | PK, `gen_random_uuid()`              | Primary Key                  |
| `encounter_id`         | `uuid`                     | FK (`encounters.id`), NOT NULL       | Encounter reference          |
| `patient_id`           | `uuid`                     | FK (`patient_profiles.id`), NOT NULL | Patient reference            |
| `doctor_id`            | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL  | Doctor reference             |
| `diagnosis`            | `text`                     | NOT NULL                             | Clinical diagnosis           |
| `special_instructions` | `text`                     | NULLABLE                             | Diet, lifestyle instructions |
| `valid_until`          | `date`                     | NOT NULL                             | Prescription validity expiry |
| `created_at`           | `timestamp with time zone` | DEFAULT `now()`                      | Record creation timestamp    |

#### `prescription_items`

Itemized medication lines attached to a prescription master.

| Column            | Type           | Constraints                       | Description                         |
| :---------------- | :------------- | :-------------------------------- | :---------------------------------- |
| `id`              | `uuid`         | PK, `gen_random_uuid()`           | Primary Key                         |
| `prescription_id` | `uuid`         | FK (`prescriptions.id`), NOT NULL | Parent prescription                 |
| `medicine_name`   | `varchar(200)` | NOT NULL                          | Generic / Brand medicine name       |
| `dosage`          | `varchar(50)`  | NOT NULL                          | Dosage (e.g., 500mg)                |
| `frequency`       | `varchar(50)`  | NOT NULL                          | Frequency (e.g., 1-0-1 after meals) |
| `duration_days`   | `integer`      | NOT NULL                          | Duration in days                    |
| `route`           | `varchar(50)`  | DEFAULT `'ORAL'`                  | Route (ORAL, IV, TOPICAL)           |

---

### 5. Inpatient (IPD) & Bed Management Context

#### `wards`

Hospital wards / units (ICU, Maternity, General Ward, Pediatric).

| Column        | Type            | Constraints                           | Description                                          |
| :------------ | :-------------- | :------------------------------------ | :--------------------------------------------------- |
| `id`          | `uuid`          | PK, `gen_random_uuid()`               | Primary Key                                          |
| `hospital_id` | `uuid`          | FK (`hospitals.id`), NOT NULL         | Tenant hospital                                      |
| `branch_id`   | `uuid`          | FK (`hospital_branches.id`), NOT NULL | Facility branch                                      |
| `name`        | `varchar(100)`  | NOT NULL                              | Ward name                                            |
| `type`        | `varchar(30)`   | NOT NULL                              | Ward type (`ICU`, `GENERAL`, `PRIVATE`, `ISOLATION`) |
| `daily_rate`  | `numeric(10,2)` | NOT NULL                              | Standard daily occupancy charge                      |

#### `beds`

Physical bed management and real-time occupancy status.

| Column       | Type          | Constraints                     | Description                                                |
| :----------- | :------------ | :------------------------------ | :--------------------------------------------------------- |
| `id`         | `uuid`        | PK, `gen_random_uuid()`         | Primary Key                                                |
| `ward_id`    | `uuid`        | FK (`wards.id`), NOT NULL       | Parent ward                                                |
| `bed_number` | `varchar(30)` | NOT NULL                        | Unique bed tag within ward                                 |
| `status`     | `varchar(20)` | NOT NULL, DEFAULT `'AVAILABLE'` | Status: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `RESERVED` |

#### `admissions`

Inpatient hospital admission & discharge record.

| Column                | Type                       | Constraints                          | Description                                     |
| :-------------------- | :------------------------- | :----------------------------------- | :---------------------------------------------- |
| `id`                  | `uuid`                     | PK, `gen_random_uuid()`              | Primary Key                                     |
| `hospital_id`         | `uuid`                     | FK (`hospitals.id`), NOT NULL        | Tenant hospital                                 |
| `patient_id`          | `uuid`                     | FK (`patient_profiles.id`), NOT NULL | Patient reference                               |
| `bed_id`              | `uuid`                     | FK (`beds.id`), NOT NULL             | Allocated bed reference                         |
| `admitting_doctor_id` | `uuid`                     | FK (`doctor_profiles.id`), NOT NULL  | Admitting doctor                                |
| `admitted_at`         | `timestamp with time zone` | NOT NULL                             | Admission timestamp                             |
| `discharged_at`       | `timestamp with time zone` | NULLABLE                             | Discharge timestamp                             |
| `discharge_summary`   | `text`                     | NULLABLE                             | Clinical summary at discharge                   |
| `status`              | `varchar(20)`              | DEFAULT `'ADMITTED'`                 | Status: `ADMITTED`, `DISCHARGED`, `TRANSFERRED` |

---

### 6. Financials, Billing & Claims Context

#### `invoices`

Hospital billing master for OPD consultations, IPD stays, lab tests, and procedures.

| Column            | Type                       | Constraints                          | Description                                      |
| :---------------- | :------------------------- | :----------------------------------- | :----------------------------------------------- |
| `id`              | `uuid`                     | PK, `gen_random_uuid()`              | Primary Key                                      |
| `hospital_id`     | `uuid`                     | FK (`hospitals.id`), NOT NULL        | Tenant hospital                                  |
| `patient_id`      | `uuid`                     | FK (`patient_profiles.id`), NOT NULL | Patient reference                                |
| `encounter_id`    | `uuid`                     | FK (`encounters.id`), NULLABLE       | Associated encounter                             |
| `invoice_number`  | `varchar(50)`              | UNIQUE, NOT NULL                     | Unique invoice sequence number                   |
| `subtotal`        | `numeric(10,2)`            | NOT NULL                             | Sum of item prices                               |
| `tax_amount`      | `numeric(10,2)`            | DEFAULT 0.00                         | Tax amount                                       |
| `discount_amount` | `numeric(10,2)`            | DEFAULT 0.00                         | Applied discounts                                |
| `total_amount`    | `numeric(10,2)`            | NOT NULL                             | Final bill total                                 |
| `paid_amount`     | `numeric(10,2)`            | DEFAULT 0.00                         | Total paid to date                               |
| `payment_status`  | `varchar(20)`              | DEFAULT `'PENDING'`                  | Status: `PENDING`, `PARTIAL`, `PAID`, `REFUNDED` |
| `created_at`      | `timestamp with time zone` | DEFAULT `now()`                      | Billing creation timestamp                       |

#### `invoice_items`

Itemized line items on hospital invoices.

| Column        | Type            | Constraints                  | Description                                                                |
| :------------ | :-------------- | :--------------------------- | :------------------------------------------------------------------------- |
| `id`          | `uuid`          | PK, `gen_random_uuid()`      | Primary Key                                                                |
| `invoice_id`  | `uuid`          | FK (`invoices.id`), NOT NULL | Parent invoice                                                             |
| `item_type`   | `varchar(30)`   | NOT NULL                     | Type (`CONSULTATION`, `BED_CHARGE`, `LAB_TEST`, `MEDICATION`, `PROCEDURE`) |
| `description` | `varchar(255)`  | NOT NULL                     | Line item description                                                      |
| `quantity`    | `integer`       | DEFAULT 1                    | Item quantity                                                              |
| `unit_price`  | `numeric(10,2)` | NOT NULL                     | Unit price                                                                 |
| `total_price` | `numeric(10,2)` | NOT NULL                     | Quantity * Unit Price                                                      |

#### `payments`

Ledger of payment transactions processed against invoices.

| Column            | Type                       | Constraints                  | Description                                           |
| :---------------- | :------------------------- | :--------------------------- | :---------------------------------------------------- |
| `id`              | `uuid`                     | PK, `gen_random_uuid()`      | Primary Key                                           |
| `invoice_id`      | `uuid`                     | FK (`invoices.id`), NOT NULL | Linked invoice                                        |
| `payment_method`  | `varchar(30)`              | NOT NULL                     | Method (`STRIPE`, `CASH`, `CREDIT_CARD`, `INSURANCE`) |
| `transaction_ref` | `varchar(100)`             | NULLABLE                     | External gateway reference ID                         |
| `amount`          | `numeric(10,2)`            | NOT NULL                     | Transaction amount                                    |
| `status`          | `varchar(20)`              | DEFAULT `'SUCCESS'`          | Status: `SUCCESS`, `FAILED`, `REFUNDED`               |
| `created_at`      | `timestamp with time zone` | DEFAULT `now()`              | Transaction timestamp                                 |

#### `insurance_claims`

Third-party medical insurance claim management.

| Column               | Type                       | Constraints                          | Description                                                      |
| :------------------- | :------------------------- | :----------------------------------- | :--------------------------------------------------------------- |
| `id`                 | `uuid`                     | PK, `gen_random_uuid()`              | Primary Key                                                      |
| `hospital_id`        | `uuid`                     | FK (`hospitals.id`), NOT NULL        | Tenant hospital                                                  |
| `patient_id`         | `uuid`                     | FK (`patient_profiles.id`), NOT NULL | Patient reference                                                |
| `invoice_id`         | `uuid`                     | FK (`invoices.id`), UNIQUE, NOT NULL | Linked hospital invoice                                          |
| `provider_name`      | `varchar(150)`             | NOT NULL                             | Insurance company name                                           |
| `policy_number`      | `varchar(100)`             | NOT NULL                             | Insurance policy number                                          |
| `claim_amount`       | `numeric(10,2)`            | NOT NULL                             | Amount claimed                                                   |
| `approved_amount`    | `numeric(10,2)`            | DEFAULT 0.00                         | Amount approved by payer                                         |
| `status`             | `varchar(20)`              | DEFAULT `'SUBMITTED'`                | Status: `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `PAID` |
| `adjudication_notes` | `text`                     | NULLABLE                             | Notes from insurer                                               |
| `created_at`         | `timestamp with time zone` | DEFAULT `now()`                      | Claim filing timestamp                                           |

---

### 7. Governance, Audit & Observability Context

#### `audit_logs`

Immutable compliance and HIPAA security audit trail tracking data access and mutations.

| Column           | Type                       | Constraints                   | Description                                     |
| :--------------- | :------------------------- | :---------------------------- | :---------------------------------------------- |
| `id`             | `uuid`                     | PK, `gen_random_uuid()`       | Primary Key                                     |
| `hospital_id`    | `uuid`                     | FK (`hospitals.id`), NULLABLE | Hospital scope                                  |
| `actor_id`       | `uuid`                     | FK (`users.id`), NULLABLE     | User who performed action                       |
| `actor_role`     | `varchar(50)`              | NOT NULL                      | Role at execution time                          |
| `action`         | `varchar(50)`              | NOT NULL                      | Action (e.g., `CREATE_APPOINTMENT`, `READ_EHR`) |
| `entity_name`    | `varchar(50)`              | NOT NULL                      | Target table/entity                             |
| `entity_id`      | `uuid`                     | NULLABLE                      | Target entity UUID                              |
| `ip_address`     | `inet`                     | NULLABLE                      | Client IP address                               |
| `changes_before` | `jsonb`                    | NULLABLE                      | Pre-mutation state                              |
| `changes_after`  | `jsonb`                    | NULLABLE                      | Post-mutation state                             |
| `created_at`     | `timestamp with time zone` | DEFAULT `now()`               | Audit timestamp                                 |

---

## Concurrency Safety & State Machines

### 1. Pessimistic Lock for Slot Booking (`SELECT FOR UPDATE`)

To prevent double booking when multiple patients attempt to reserve the same time slot concurrently:

```sql
BEGIN;
-- Lock slot row exclusively:
SELECT id, status FROM slots
WHERE id = 'slot-uuid' AND status = 'AVAILABLE'
FOR UPDATE;

-- Update slot status:
UPDATE slots SET status = 'BOOKED' WHERE id = 'slot-uuid';

-- Create appointment:
INSERT INTO appointments (id, hospital_id, patient_id, doctor_id, slot_id, status)
VALUES (gen_random_uuid(), 'hosp-uuid', 'patient-uuid', 'doctor-uuid', 'slot-uuid', 'SCHEDULED');

COMMIT;
```

### 2. Bed Allocation Lock (`SELECT FOR UPDATE`)

To ensure two IPD patients are not assigned to the same hospital bed:

```sql
BEGIN;
SELECT id, status FROM beds
WHERE id = 'bed-uuid' AND status = 'AVAILABLE'
FOR UPDATE;

UPDATE beds SET status = 'OCCUPIED' WHERE id = 'bed-uuid';

INSERT INTO admissions (id, hospital_id, patient_id, bed_id, admitting_doctor_id, admitted_at, status)
VALUES (gen_random_uuid(), 'hosp-uuid', 'patient-uuid', 'bed-uuid', 'doctor-uuid', NOW(), 'ADMITTED');

COMMIT;
```

### 3. State Transition Lifecycle Matrices

#### Appointment Lifecycle:

- `SCHEDULED` $\rightarrow$ `CHECKED_IN` (Patient arrives at clinic)
- `CHECKED_IN` $\rightarrow$ `IN_CONSULTATION` (Doctor begins encounter)
- `IN_CONSULTATION` $\rightarrow$ `COMPLETED` (Doctor finalizes SOAP notes & prescription)
- `SCHEDULED` $\rightarrow$ `CANCELLED` (Slot freed back to `AVAILABLE`)
- `SCHEDULED` $\rightarrow$ `NO_SHOW` (Patient fails to arrive)

#### Inpatient Admission Lifecycle:

- `ADMITTED` $\rightarrow$ `TRANSFERRED` (Bed changed/upgraded)
- `ADMITTED` $\rightarrow$ `DISCHARGED` (Bed freed back to `AVAILABLE`, invoice generated)

#### Insurance Claim Lifecycle:

- `SUBMITTED` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `APPROVED` / `REJECTED` $\rightarrow$ `PAID`

---

## Indexing Strategy & Performance Guidelines

| Index Identifier         | Target Table       | Columns                             | Type      | Purpose                                      |
| :----------------------- | :----------------- | :---------------------------------- | :-------- | :------------------------------------------- |
| `IDX_USERS_EMAIL`        | `users`            | `email`                             | B-tree    | Fast auth lookup                             |
| `IDX_PATIENT_MRN`        | `patient_profiles` | `mrn`                               | B-tree    | Rapid patient lookup by MRN                  |
| `IDX_PATIENT_HOSPITAL`   | `patient_profiles` | `(hospital_id, user_id)`            | Composite | Multi-tenant patient querying                |
| `IDX_DOCTOR_SPECIALTY`   | `doctor_profiles`  | `(hospital_id, specialization)`     | Composite | Filter doctors by department & specialty     |
| `IDX_SLOTS_AVAILABILITY` | `slots`            | `(doctor_id, status, starts_at)`    | Composite | OPD slot booking availability query          |
| `IDX_APPOINTMENTS_LIST`  | `appointments`     | `(hospital_id, patient_id, status)` | Composite | Patient dashboard appointment lists          |
| `IDX_BEDS_STATUS`        | `beds`             | `(ward_id, status)`                 | Composite | Real-time bed availability check             |
| `IDX_INVOICES_STATUS`    | `invoices`         | `(hospital_id, payment_status)`     | Composite | Billing queue processing                     |
| `IDX_AUDIT_TIMELINE`     | `audit_logs`       | `(hospital_id, created_at DESC)`    | Composite | Compliance reporting & log audit             |
| `GIN_PATIENT_MED_HIST`   | `patient_profiles` | `medical_history`                   | GIN       | Fast JSON query over patient medical history |
| `GIN_AUDIT_CHANGES`      | `audit_logs`       | `changes_after`                     | GIN       | Fast payload search in security audit logs   |

---

## Data Archiving & Partitioning Strategy

- **Audit Logs Partitioning**: The `audit_logs` table is partitioned by range on `created_at` monthly (e.g., `audit_logs_y2026m08`) to ensure sub-millisecond write times and low index overhead.
- **Soft Deletion Filtering**: Tables with `deleted_at` (`hospitals`, `users`, `patient_profiles`, `doctor_profiles`, `appointments`) utilize PostgreSQL Partial Indexes:
  ```sql
  CREATE INDEX IDX_ACTIVE_APPOINTMENTS ON appointments (patient_id, status)
  WHERE deleted_at IS NULL;
  ```
