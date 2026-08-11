# REST API Contract Specification — Hospital Appointment System

## Standard Response Envelope

All API endpoints return JSON responses wrapped in a standard envelope:

```json
{
  "data": T
}
```

Error responses return standard NestJS exception envelopes:

```json
{
  "statusCode": 400,
  "message": "Error description message",
  "error": "Bad Request"
}
```

---

## Endpoints Summary

### 0. Authentication Endpoints (`/auth`)

#### `POST /auth/register`

Register a new Patient account.

- **Request Body**:

```json
{
  "email": "patient@hospital.com",
  "password": "Patient@123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

- **Response**: `201 Created`

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "u4444444-4444-4444-4444-444444444444",
    "email": "patient@hospital.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "name": "Jane Doe",
    "phone": "+1234567890",
    "role": "PATIENT",
    "isActive": true
  }
}
```

#### `POST /auth/login`

Authenticate user and obtain JWT tokens.

- **Request Body**:

```json
{
  "email": "patient@hospital.com",
  "password": "Patient@123"
}
```

- **Response**: `200 OK`

#### `POST /auth/refresh`

Obtain new Access Token using valid Refresh Token.

- **Request Body**:

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

#### `POST /auth/logout`

Invalidate current user refresh token.

- **Response**: `200 OK`

#### `GET /auth/me` or `/auth/profile`

Get currently logged-in user profile. Protected by Bearer token / Cookie.

---

### 1. Doctor Endpoints (`/doctors`)

#### `GET /doctors`

List doctor profiles with optional filters.

- **Query Parameters**:
  - `specialization` (string, optional)
  - `isActive` (boolean, optional)
  - `search` (string, optional)
- **Response**: `200 OK`

```json
{
  "data": [
    {
      "id": "d1111111-1111-1111-1111-111111111111",
      "userId": "u1111111-1111-1111-1111-111111111111",
      "firstName": "Rajesh",
      "lastName": "Sharma",
      "specialization": "Cardiology",
      "qualification": "MD, FACC (Cardiology)",
      "experienceYears": 14,
      "consultationFee": 750,
      "biography": "Senior Interventional Cardiologist...",
      "profileImage": "https://...",
      "isActive": true
    }
  ]
}
```

#### `GET /doctors/:id/slots`

Get available, future consultation slots for a doctor.

- **Response**: `200 OK`

```json
{
  "data": [
    {
      "id": "s1111111-1111-1111-1111-111111111113",
      "doctorId": "d1111111-1111-1111-1111-111111111111",
      "startsAt": "2026-08-11T09:00:00.000Z",
      "endsAt": "2026-08-11T09:30:00.000Z",
      "status": "AVAILABLE"
    }
  ]
}
```

---

### 2. Slot Endpoints (`/slots`)

#### `GET /slots`

List consultation slots.

- **Query Parameters**:
  - `doctorId` (UUID, optional)
  - `status` (`AVAILABLE` | `BOOKED` | `BLOCKED`, optional)
  - `startDate` (ISO Date, optional)
  - `endDate` (ISO Date, optional)

#### `GET /slots/:id`

Get slot details by UUID.

#### `POST /slots`

Create a consultation slot (Doctor / Admin only).

- **Validation Rules**: Must be exactly 30 minutes in duration, future date, no overlapping slots for the same doctor.
- **Request Body**:

```json
{
  "doctorId": "d1111111-1111-1111-1111-111111111111",
  "startsAt": "2026-08-12T10:00:00Z",
  "endsAt": "2026-08-12T10:30:00Z"
}
```

#### `PATCH /slots/:id`

Update slot status (e.g. block or unblock slot).

- **Request Body**: `{"status": "BLOCKED"}`

#### `DELETE /slots/:id`

Delete an unbooked slot. Returns `400 Bad Request` if slot is currently `BOOKED`.

---

### 3. Appointment Endpoints (`/appointments`)

#### `GET /appointments`

List appointments with role-scoped data access, hospital-wide keyword search, and filters.

- **Authentication**: Required (JWT Bearer token).
- **Role Scoping Rules**:
  - `PATIENT`: Sees ONLY appointments where `patientId == currentUser.id`. Medical notes are stripped from response.
  - `DOCTOR`: Sees ONLY appointments for slots owned by `currentUser` doctor profile.
  - `ADMIN`: Full access to all hospital appointments across all departments.
- **Query Parameters**:
  - `patientId` (UUID, optional — Admin only)
  - `doctorId` (UUID, optional — Admin only)
  - `status` (`SCHEDULED` | `CANCELLED` | `COMPLETED`, optional)
  - `dateFrom` (ISO Date string, optional)
  - `dateTo` (ISO Date string, optional)
  - `q` (string, optional) — Hospital-wide search across doctor names, specializations, visit reasons, and patient IDs.
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
  - `sort` (`createdAt` | `startsAt`, default: `startsAt`)

#### `GET /appointments/:id`

Get appointment by UUID (Role Scoped).

- **Authentication**: Required. Patients can view only their own appointment; Doctors can view only their own slot appointments.

#### `POST /appointments`

Book an appointment for a specific slot (Transactional & Pessimistic Lock Protected).

- **Authentication**: Required (Patient Bearer Token). `patientId` is resolved automatically from JWT payload.
- **Request Body**:

```json
{
  "slotId": "s1111111-1111-1111-1111-111111111113",
  "reason": "Routine cardiac checkup"
}
```

- **Response**: `201 Created`
- **Error Responses**:
  - `400 Bad Request`: Slot in past or invalid payload.
  - `401 Unauthorized`: Missing or invalid JWT token.
  - `409 Conflict`: Slot already booked or locked by concurrent request (`SELECT FOR UPDATE`).

#### `POST /appointments/:id/complete`

Complete a consultation, record clinical diagnosis notes, and issue a digital prescription (Transactional).

- **Authentication**: Required (Doctor or Admin role).
- **Role Validation**: Doctors can ONLY complete appointments belonging to their own slots.
- **Request Body**:

```json
{
  "prescription": {
    "medicines": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "Twice daily after meals",
        "duration": "7 days"
      }
    ],
    "instructions": "Take with plenty of water. Finish entire course."
  },
  "medicalNote": {
    "notes": "Patient displays mild throat inflammation. Recommended warm saline gargle."
  }
}
```

- **Response**: `200 OK` (returns updated appointment with attached prescription & internal note).
- **Error Responses**:
  - `400 Bad Request`: Appointment is already completed or cancelled.
  - `403 Forbidden`: Patient attempt to complete, or doctor attempting to complete another doctor's visit.
  - `404 Not Found`: Appointment ID not found.

#### `PATCH /appointments/:id`

Update appointment status or visit reason.

#### `DELETE /appointments/:id`

Cancel and soft-delete an appointment.

- **Authentication**: Required. Patient can only cancel their own appointment unless role is `ADMIN`.
- **Response**: `200 OK`
- **Error Responses**:
  - `403 Forbidden`: Attempting to cancel another patient's appointment.
  - `400 Bad Request`: Attempting to cancel an already cancelled or completed appointment.

---

### 4. Prescription Endpoints (`/prescriptions`)

#### `GET /prescriptions`

List prescriptions. Protected by JWT authentication.

#### `GET /prescriptions/:id`

Get prescription details by UUID. Protected by JWT authentication.

#### `POST /prescriptions`

Create a new prescription (Doctor / Admin only).

---

### 5. Medical Note Endpoints (`/medical-notes`)

#### `GET /medical-notes`

List clinical medical notes by `appointmentId` or `doctorId`.

- **Security Rule**: Protected by JWT authentication. Restricted to `DOCTOR` and `ADMIN` roles. `PATIENT` role access returns `403 Forbidden`.

#### `GET /medical-notes/:id`

Get clinical medical note by UUID. Restricted to `DOCTOR` and `ADMIN` roles.

#### `POST /medical-notes`

Add a clinical medical note (Doctor / Admin only).
