# Hospital Appointment System — 5-Minute Assessment Evaluation Demo

This document outlines the step-by-step 5-minute evaluation demonstration for reviewers to verify all required domain invariants, role-based access controls, transactional booking, and clinical workflows.

---

## 1. Demo Credentials & Roles Setup

| Role            | Email                   | Password      | Primary Capabilities                                                          |
| :-------------- | :---------------------- | :------------ | :---------------------------------------------------------------------------- |
| **PATIENT**     | `patient@hospital.com`  | `Patient123!` | Browse doctors, view slots, self-only booking, self-only cancellation         |
| **PATIENT (B)** | `patient2@hospital.com` | `Patient123!` | Used for double-booking concurrency conflict demonstration                    |
| **DOCTOR**      | `doctor@hospital.com`   | `Doctor123!`  | View assigned appointments, complete visit, add prescriptions & medical notes |
| **ADMIN**       | `admin@hospital.com`    | `Admin123!`   | Hospital-wide search, doctor management, soft-delete doctor, system settings  |

---

## 2. Step-by-Step Walkthrough

### Part 1 — Role-Based Interface & Navigation

1. Open application at `http://localhost:3000`.
2. Login as **PATIENT** (`patient@hospital.com`).
   - Notice navigation links: **Doctors Directory**, **My Appointments**, **Profile**.
3. Logout and login as **DOCTOR** (`doctor@hospital.com`).
   - Notice navigation links: **Doctor Schedule**, **My Patient Visits**, **Profile**.
4. Logout and login as **ADMIN** (`admin@hospital.com`).
   - Notice navigation links: **Doctor Management**, **Hospital Search**, **User Admin**.

---

### Part 2 — Happy Path Booking Flow

1. Login as **PATIENT** (`patient@hospital.com`).
2. Navigate to **Doctors Directory** (`/doctors`). Select Dr. Sarah Jenkins (Cardiology).
3. Select an **AVAILABLE** slot for tomorrow at 10:00 AM.
4. Click **Book Consultation**, enter visit reason: _"Routine Heart Checkup"_, and submit.
5. Verification:
   - Success toast appears.
   - Redirected to **My Appointments** (`/appointments`).
   - Appointment status shows **SCHEDULED**.

---

### Part 3 — Cancellation & Slot Recovery

1. On **My Appointments** page, locate the scheduled consultation with Dr. Sarah Jenkins.
2. Click **Cancel Appointment** and confirm.
3. Verification:
   - Appointment status transitions to **CANCELLED**.
   - Return to Dr. Sarah Jenkins' profile page -> The slot at 10:00 AM returns to **AVAILABLE** status.

---

### Part 4 — Double Booking Concurrency & Pessimistic Lock Test

1. Open two browser windows (or Incognito):
   - **Window A**: Patient A (`patient@hospital.com`).
   - **Window B**: Patient B (`patient2@hospital.com`).
2. Navigate both windows to Dr. Sarah Jenkins' profile for slot **11:00 AM**.
3. Submit booking concurrently in both windows.
4. Verification:
   - **Patient A**: Booking succeeds (`201 Created`).
   - **Patient B**: Receives `409 Conflict` with message _"This slot is already booked by another patient"_.
   - Database invariant verified: Zero double-bookings permitted.

---

### Part 5 — Authorization & RBAC Edge Cases

1. **Unauthorized Patient Access**:
   - Login as Patient B (`patient2@hospital.com`).
   - Attempt to access or cancel Patient A's appointment ID via direct URL (`/appointments/{patient-a-id}`).
   - Verification: System rejects request with `403 Forbidden` / `404 Not Found`.
2. **Unauthorized Route Guard**:
   - Patient attempts to navigate directly to `/admin/appointments` or `/doctor/appointments`.
   - Verification: Route Guard redirects or displays `403 Access Denied`.

---

### Part 6 — Doctor Clinical Workflow

1. Login as **DOCTOR** (`doctor@hospital.com`).
2. Navigate to **Doctor Portal** (`/doctor/appointments`).
3. Select the scheduled visit for Patient A.
4. Click **Complete Visit**:
   - Add Prescription: _Amoxicillin 500mg (1 tablet twice daily for 7 days)_.
   - Add Medical Note: _"Patient presented normal vital signs. Prescribed antibiotics."_
5. Click **Submit & Complete**.
6. Verification:
   - Appointment status transitions to **COMPLETED**.
   - Prescription record saved and linked (1:1).

---

### Part 7 — Admin Hospital-Wide Search & Doctor Soft-Delete

1. Login as **ADMIN** (`admin@hospital.com`).
2. Navigate to **Admin Appointments Search** (`/admin/appointments`).
3. Filter appointments by `Status = COMPLETED` and date range.
4. Navigate to **Doctor Management** (`/admin/doctors`).
5. Select a doctor profile and click **Soft Delete Doctor**.
6. Verification:
   - Doctor disappears from public **Doctor Directory**.
   - All future available slots for that doctor are updated to **BLOCKED** status.
