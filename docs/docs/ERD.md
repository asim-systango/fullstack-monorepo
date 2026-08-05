# Entity Relationship Diagram (ERD) — Day 02 Foundation

The relational architecture of the **Hospital Appointment System** models entity relationships for Doctors, Time Slots, Appointments, Prescriptions, and Medical Notes.

```mermaid
erDiagram
    DoctorProfile ||--o{ Slot : "configures (1:N)"
    DoctorProfile ||--o{ MedicalNote : "records (1:N)"
    Slot ||--o| Appointment : "reserved_in (1:1)"
    Appointment ||--o| Prescription : "has (1:1)"
    Appointment ||--o{ MedicalNote : "contains (1:N)"

    DoctorProfile {
        uuid id PK
        uuid userId UNIQUE
        string firstName
        string lastName
        string specialization INDEX
        string qualification
        int experienceYears
        numeric consultationFee
        text biography
        string profileImage
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    Slot {
        uuid id PK
        uuid doctorId FK
        timestamp startsAt
        timestamp endsAt
        enum status "AVAILABLE | BOOKED | BLOCKED"
        timestamp createdAt
        timestamp updatedAt
    }

    Appointment {
        uuid id PK
        uuid patientId INDEX
        uuid slotId FK, UNIQUE
        enum status "SCHEDULED | CANCELLED | COMPLETED"
        text reason
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    Prescription {
        uuid id PK
        uuid appointmentId FK, UNIQUE
        jsonb medicines
        text instructions
        timestamp createdAt
        timestamp updatedAt
    }

    MedicalNote {
        uuid id PK
        uuid appointmentId FK
        uuid doctorId FK
        text notes
        timestamp createdAt
    }
```

## Domain Entity Relationships

1. **DoctorProfile to Slot (1:N)**: A doctor profile can have multiple available, booked, or blocked consultation time slots.
2. **Slot to Appointment (1:1)**: An appointment is booked strictly against a single unique time slot (`slotId` UNIQUE constraint).
3. **Appointment to Prescription (1:1)**: An appointment can have at most one official medical prescription attached (`appointmentId` UNIQUE constraint).
4. **Appointment to MedicalNote (1:N)**: An appointment can accumulate multiple clinical observation notes over time.
5. **DoctorProfile to MedicalNote (1:N)**: Medical notes reference the authoring doctor profile.
