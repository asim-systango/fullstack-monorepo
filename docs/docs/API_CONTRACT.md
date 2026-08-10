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

#### `GET /doctors/:id`

Get detailed doctor profile by UUID.

- **Response**: `200 OK`
- **Error**: `404 Not Found`

#### `POST /doctors`

Create a new doctor profile.

#### `PATCH /doctors/:id`

Update doctor profile details.

#### `DELETE /doctors/:id`

Soft-delete doctor profile.

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

Create a consultation slot.

#### `PATCH /slots/:id`

Update slot status.

#### `DELETE /slots/:id`

Delete a slot.

---

### 3. Appointment Endpoints (`/appointments`)

#### `GET /appointments`

List appointments with optional filters.

- **Query Parameters**:
  - `patientId` (UUID, optional)
  - `doctorId` (UUID, optional)
  - `status` (`SCHEDULED` | `CANCELLED` | `COMPLETED`, optional)

#### `GET /appointments/:id`

Get appointment by UUID (includes relation details).

#### `POST /appointments`

Book an appointment for a specific slot.

- **Request Body**:

```json
{
  "slotId": "s1111111-1111-1111-1111-111111111113",
  "reason": "Routine cardiac checkup"
}
```

#### `PATCH /appointments/:id`

Update appointment status or visit reason.

#### `DELETE /appointments/:id`

Cancel and soft-delete an appointment.

---

### 4. Prescription Endpoints (`/prescriptions`)

#### `GET /prescriptions`

List all prescriptions or query by `appointmentId`.

#### `GET /prescriptions/:id`

Get prescription details by UUID.

#### `POST /prescriptions`

Create a new prescription.

---

### 5. Medical Note Endpoints (`/medical-notes`)

#### `GET /medical-notes`

List clinical medical notes by `appointmentId` or `doctorId`.

#### `GET /medical-notes/:id`

Get clinical medical note by UUID.

#### `POST /medical-notes`

Add a clinical medical note.
