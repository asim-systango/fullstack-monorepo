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
