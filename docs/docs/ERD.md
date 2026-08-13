# Entity Relationship Diagram (ERD) — PulseCare Hospital Appointment System

## Overview

Every person in the system is stored in the `users` table with a `role` column (`ADMIN | DOCTOR | PATIENT`).
Each role has a **dedicated extended-profile table** that stores role-specific data while keeping `users` lean.

```
users (role='ADMIN')    ──1:1──▶  hospital_admins   (hospital name, department, job title)
users (role='DOCTOR')   ──1:1──▶  doctor_profiles   (specialization, fees, documents)
users (role='PATIENT')  ──1:1──▶  patient_profiles  (blood group, DOB, allergies)
```

---

## Full ERD

```mermaid
erDiagram

    %% ── Identity & Profiles ────────────────────────────────────────────────
    USERS ||--o| HOSPITAL_ADMINS   : "has profile (role=ADMIN)"
    USERS ||--o| DOCTOR_PROFILES   : "has profile (role=DOCTOR)"
    USERS ||--o| PATIENT_PROFILES  : "has profile (role=PATIENT)"

    %% ── Scheduling ─────────────────────────────────────────────────────────
    DOCTOR_PROFILES ||--o{ SLOTS        : "manages"
    SLOTS           ||--o| APPOINTMENTS : "booked as"

    %% ── Appointments link to users (not patient_profiles) ──────────────────
    USERS ||--o{ APPOINTMENTS : "patient books (role=PATIENT)"

    %% ── Clinical records ────────────────────────────────────────────────────
    APPOINTMENTS ||--o| PRESCRIPTIONS : "has"
    APPOINTMENTS ||--o{ MEDICAL_NOTES : "records"
    DOCTOR_PROFILES ||--o{ MEDICAL_NOTES : "writes"

    %% ── Entity Definitions ──────────────────────────────────────────────────

    USERS {
        uuid    id          PK
        string  email       UK
        string  passwordHash
        string  firstName
        string  lastName
        string  phone
        string  role        "ADMIN | DOCTOR | PATIENT"
        boolean isActive
        boolean emailVerified
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    HOSPITAL_ADMINS {
        uuid    id            PK
        uuid    userId        FK-UK  "→ users.id (role=ADMIN)"
        string  hospitalName
        string  department
        string  jobTitle
        string  officePhone
        string  address
        string  profileImage
        timestamp createdAt
        timestamp updatedAt
    }

    DOCTOR_PROFILES {
        uuid    id              PK
        uuid    userId          FK-UK  "→ users.id (role=DOCTOR)"
        string  firstName
        string  lastName
        string  specialization
        string  qualification
        integer experienceYears
        decimal consultationFee
        decimal hospitalCharge
        string  medicalLicense
        text    biography
        string  profileImage
        jsonb   documents
        boolean isActive
        string  approvalStatus  "PENDING | APPROVED | REJECTED"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    PATIENT_PROFILES {
        uuid    id               PK
        uuid    userId           FK-UK  "→ users.id (role=PATIENT)"
        string  firstName
        string  lastName
        date    dateOfBirth
        string  gender           "MALE | FEMALE | OTHER"
        string  bloodGroup       "A+ / B- / O+ etc."
        string  emergencyContact
        text    allergies
        text    medicalHistory
        string  profileImage
        timestamp createdAt
        timestamp updatedAt
    }

    SLOTS {
        uuid      id        PK
        uuid      doctorId  FK   "→ doctor_profiles.id"
        timestamp startsAt
        timestamp endsAt
        string    status    "AVAILABLE | BOOKED | BLOCKED"
        timestamp createdAt
        timestamp updatedAt
    }

    APPOINTMENTS {
        uuid      id               PK
        uuid      patientId        FK   "→ users.id (role=PATIENT)"
        uuid      slotId           FK-UK
        string    status           "SCHEDULED | CANCELLED | COMPLETED"
        string    type             "IN_PERSON | TELECONSULT"
        text      reason
        decimal   consultationFee
        decimal   hospitalCharge
        decimal   totalAmount
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    PRESCRIPTIONS {
        uuid   id            PK
        uuid   appointmentId FK-UK
        jsonb  medicines
        text   instructions
        timestamp createdAt
        timestamp updatedAt
    }

    MEDICAL_NOTES {
        uuid   id            PK
        uuid   appointmentId FK
        uuid   doctorId      FK   "→ doctor_profiles.id"
        text   notes
        timestamp createdAt
    }
```

---

## Key Design Decisions

| Decision                                      | Reason                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| **Single `users` table for all roles**        | Auth and identity (email, password, JWT) is shared — no duplication          |
| **Separate profile tables per role**          | Each role has unique data fields; keeps `users` lean and role-agnostic       |
| **`appointments.patientId` → `users.id`**     | Direct link for fast booking without joining through `patient_profiles`      |
| **`slots.doctorId` → `doctor_profiles.id`**   | Doctor availability is driven by the profile (which holds `consultationFee`) |
| **Profile tables are optional (nullable FK)** | A user can exist without a profile; profiles are created on-demand           |
