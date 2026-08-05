# API Contract & Endpoint Documentation — Day 04

Base API URL: `http://localhost:4000/api/v1`

Standard Response Structure:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message description",
  "statusCode": 409
}
```

---

## 0. Authentication Endpoints (`/auth`)

| Method | Path | Summary | Guard / Role | Success Status |
|---|---|---|---|---|
| `POST` | `/auth/register` | Patient registration | `@Public()` | 201 Created |
| `POST` | `/auth/login` | Returns Access & Refresh Tokens + User | `@Public()` | 200 OK |
| `POST` | `/auth/refresh` | Generate new Access Token | `@Public()` | 200 OK |
| `POST` | `/auth/logout` | Invalidate DB Refresh Token session | Protected | 200 OK |
| `GET` | `/auth/profile` | Returns current logged-in user | Protected | 200 OK |

---

## 1. Doctor Endpoints (`/doctors`)

| Method | Path | Summary | Guard / Role | Success Status |
|---|---|---|---|---|
| `GET` | `/doctors` | Get all active doctor profiles | Protected | 200 OK |
| `GET` | `/doctors/:id` | Get doctor profile by UUID | Protected | 200 OK |
| `GET` | `/doctors/:id/slots` | Get AVAILABLE future slots for doctor (sorted ASC) | Protected | 200 OK |
| `POST` | `/doctors` | Create doctor profile | Admin | 201 Created |
| `PATCH` | `/doctors/:id` | Update doctor profile fields | Admin / Doctor | 200 OK |
| `DELETE` | `/doctors/:id` | Soft delete doctor profile | Admin | 204 No Content |

---

## 2. Slot Endpoints (`/slots`)

| Method | Path | Summary | Guard / Role | Success Status |
|---|---|---|---|---|
| `GET` | `/slots` | Get all doctor slots | Protected | 200 OK |
| `GET` | `/slots/:id` | Get slot by UUID | Protected | 200 OK |
| `GET` | `/slots/doctor/:doctorId` | Get all slots for doctor UUID | Protected | 200 OK |
| `GET` | `/slots/doctor/:doctorId/available` | Get available future slots for doctor | Protected | 200 OK |
| `POST` | `/slots` | Create 30-min slot (Validates future & no overlap) | Doctor / Admin | 201 Created |
| `PATCH` | `/slots/:id/status` | Block / Unblock slot (`BLOCKED` / `AVAILABLE`) | Doctor / Admin | 200 OK |
| `PATCH` | `/slots/:id` | Update slot details/timing | Doctor / Admin | 200 OK |
| `DELETE` | `/slots/:id` | Delete unused slot (Cannot delete BOOKED) | Doctor / Admin | 204 No Content |

---

## 3. Appointment Endpoints (`/appointments`)

| Method | Path | Summary | Guard / Role | Success Status |
|---|---|---|---|---|
| `POST` | `/appointments` | **Transactional Booking** (`slotId`, `reason`). PatientId extracted strictly from JWT | Patient | 201 Created |
| `GET` | `/appointments` | Paginated appointments list (`status`, `dateFrom`, `dateTo`, `doctorId`, `page`, `limit`) | Protected | 200 OK |
| `GET` | `/appointments/:id` | Get appointment details by UUID (Ownership enforced) | Protected | 200 OK |
| `PATCH` | `/appointments/:id` | Update appointment status/reason | Protected | 200 OK |
| `DELETE` | `/appointments/:id` | **Transactional Cancellation**. Updates status to `CANCELLED` & frees slot to `AVAILABLE` | Patient / Admin | 200 OK |

---

## HTTP Status Codes & Error Responses

| Status Code | Description | Scenario |
|---|---|---|
| `400 Bad Request` | Validation failure or invalid input | Slot duration not 30 minutes, or slot in past |
| `401 Unauthorized` | Missing or invalid JWT token | Unauthenticated request |
| `403 Forbidden` | Ownership violation or inactive user | Patient attempting to cancel another patient's booking |
| `404 Not Found` | Resource does not exist | Slot ID or Appointment ID not found |
| `409 Conflict` | Double-booking or state conflict | Slot already booked by concurrent transaction |
| `422 Unprocessable Entity` | Business rule violation | Attempting to cancel completed appointment or book blocked slot |
