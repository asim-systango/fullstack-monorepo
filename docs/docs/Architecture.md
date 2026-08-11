# Architecture Documentation — Hospital Appointment System

## Architectural Principles & Philosophy

The **Hospital Appointment System** is designed using Clean Architecture & Domain-Driven Design (DDD) principles. This architecture decouples core business domain logic from infrastructure dependencies (database engines, framework specifics, HTTP controllers).

```
+-------------------------------------------------------------+
|                      Presentation Layer                     |
|            (NestJS Controllers / Next.js Pages)            |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      Application Layer                      |
|          (Services, DTOs, Auth Guards, Pipelines)          |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                        Domain Layer                         |
|         (Entities, Value Objects, Domain Interfaces)        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Infrastructure Layer                    |
|          (TypeORM PostgreSQL, Redis Cache, Passport)         |
+-------------------------------------------------------------+
```

---

## Transactional Booking Flow & Concurrency Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (JWT Authenticated)
    participant API as Appointment Controller
    participant Service as Appointment Service
    participant QR as QueryRunner Transaction
    participant DB as PostgreSQL Database

    Patient->>API: POST /appointments { slotId, reason }
    API->>API: Extract patientId from JWT (@CurrentUser)
    API->>Service: bookAppointment(patientId, dto)
    Service->>QR: startTransaction()

    Service->>DB: SELECT * FROM slots WHERE id = slotId FOR UPDATE
    Note over DB: Lock acquired (Pessimistic Write Lock)
    DB-->>Service: Returns Slot record

    alt Slot is BOOKED or BLOCKED
        Service->>QR: rollbackTransaction()
        Service-->>API: Throw 409 Conflict / 422 Exception
        API-->>Patient: 409 Conflict ("Slot already booked")
    else Slot is AVAILABLE & Future
        Service->>DB: INSERT INTO appointments (patientId, slotId, status, reason)
        Service->>DB: UPDATE slots SET status = 'BOOKED' WHERE id = slotId
        Service->>QR: commitTransaction()
        DB-->>Service: Transaction Committed
        Service-->>API: Return Created Appointment
        API-->>Patient: 201 Created
    end
```

---

## Transactional Cancellation Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / Admin
    participant API as Appointment Controller
    participant Service as Appointment Service
    participant QR as QueryRunner Transaction
    participant DB as PostgreSQL Database

    User->>API: DELETE /appointments/:id
    API->>Service: cancelAppointment(user, id)
    Service->>QR: startTransaction()

    Service->>DB: SELECT * FROM appointments WHERE id = id FOR UPDATE
    DB-->>Service: Return Appointment & Slot

    alt User is Patient AND appointment.patientId != user.id
        Service->>QR: rollbackTransaction()
        Service-->>API: Throw 403 Forbidden
        API-->>User: 403 Forbidden ("Cannot cancel another patient's appointment")
    else Appointment is COMPLETED or CANCELLED
        Service->>QR: rollbackTransaction()
        Service-->>API: Throw 422 Unprocessable Entity
        API-->>User: 422 Unprocessable Entity
    else Valid Cancellation Request
        Service->>DB: UPDATE appointments SET status = 'CANCELLED', deletedAt = NOW()
        Service->>DB: UPDATE slots SET status = 'AVAILABLE' WHERE id = slotId
        Service->>QR: commitTransaction()
        DB-->>Service: Transaction Committed
        Service-->>API: Return Cancelled Appointment
        API-->>User: 200 OK (Success)
    end
```

---

## Transactional Clinical Completion Sequence Diagram (Day 5)

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Doctor / Admin
    participant API as Appointment Controller
    participant Service as Appointment Service
    participant QR as QueryRunner Transaction
    participant DB as PostgreSQL Database

    Doctor->>API: POST /appointments/:id/complete { prescription, medicalNote }
    API->>Service: complete(id, user, dto)
    Service->>QR: startTransaction()

    Service->>DB: SELECT * FROM appointments WHERE id = id FOR UPDATE
    DB-->>Service: Return Appointment & Slot

    alt User is Doctor AND slot.doctorId != doctor.id
        Service->>QR: rollbackTransaction()
        Service-->>API: Throw 403 Forbidden
        API-->>Doctor: 403 Forbidden ("Doctors can only complete their own visits")
    else Appointment is CANCELLED or already COMPLETED
        Service->>QR: rollbackTransaction()
        Service-->>API: Throw 400 Bad Request
        API-->>Doctor: 400 Bad Request ("Appointment already completed or cancelled")
    else Valid Completion Request
        Service->>DB: UPDATE appointments SET status = 'COMPLETED' WHERE id = id
        opt Prescription provided
            Service->>DB: INSERT INTO prescriptions (appointmentId, medicines, instructions)
        end
        opt Medical Note provided
            Service->>DB: INSERT INTO medical_notes (appointmentId, doctorId, notes)
        end
        Service->>QR: commitTransaction()
        DB-->>Service: Transaction Committed
        Service-->>API: Return Updated Appointment with Prescription & Notes
        API-->>Doctor: 200 OK (Success)
    end
```

---

## Modular Backend Architecture (NestJS)

Each domain feature is encapsulated in a dedicated NestJS module under `src/modules/`:

1. **Users Module (`src/modules/users/`)**:
   - Manages user identity records, credentials, roles (`ADMIN`, `DOCTOR`, `PATIENT`), and hashed refresh token sessions.

2. **Auth Module (`src/auth/`)**:
   - Handles passport JWT strategies, refresh token rotation, bcrypt password hashing (12 salt rounds), and `@Roles()` / `@CurrentUser()` guards and decorators.

3. **Doctor Module (`src/modules/doctor/`)**:
   - Manages doctor profiles, medical specialties, experience ratings, and active statuses.

4. **Slot Module (`src/modules/slot/`)**:
   - Handles doctor time-slot creation (30-min duration validation, future check, overlapping slot detection), status updates (`BLOCKED` / `AVAILABLE`), and available slots queries.

5. **Appointment Module (`src/modules/appointment/`)**:
   - Core transactional booking and cancellation engine.
   - Leverages TypeORM `QueryRunner` with pessimistic write locking (`SELECT FOR UPDATE`) to guarantee concurrency safety.
   - Enforces ownership rules (patients can only book for themselves and view/cancel their own appointments).
   - Provides optimized query builder pagination and filtering.

6. **Prescription Module (`src/modules/prescription/`)**:
   - Clinical prescription generation linked directly to completed appointments.

7. **Medical Note Module (`src/modules/medical-note/`)**:
   - Confidential electronic health records (EHR) notes attached to clinical consultations.
