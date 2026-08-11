# Hospital Appointment System

# DAY 05 — Clinical Workflow, Advanced Appointment Access & Search

> Goal:
>
> Extend the appointment workflow after booking and cancellation.
>
> Doctors should be able to view their own appointments and document completed
> visits. Patients should see appropriate appointment information. Admins should
> be able to search appointments hospital-wide.
>
> Today also completes and hardens appointment filtering, which is a MUST
> requirement for the project.

---

# Your Role

You are a Senior Full-Stack Engineer working on a healthcare appointment
platform.

The core booking engine already exists.

Do not rewrite Day 1–Day 4 functionality unless necessary to fix an integration
issue.

Today's work must integrate cleanly with:

- Existing authentication
- JWT identity
- Role-based access control
- Doctor profiles
- Slots
- Appointments
- Transactions
- Existing frontend API integration

Write production-quality code.

Keep controllers thin.

Keep business rules inside services.

Never trust role, doctor ID, or patient ID supplied by the frontend when those
values can be derived from the authenticated user and existing domain records.

---

# Today's Objectives

Implement and complete:

## Backend

- Doctor appointment access
- Appointment completion workflow
- Prescriptions
- Medical notes
- Patient-safe appointment details
- Admin hospital-wide appointment search
- Required appointment filtering
- Pagination
- Sorting
- Ownership enforcement
- Appropriate data visibility

## Frontend

- Doctor appointment list
- Appointment detail view
- Complete appointment action
- Prescription form
- Medical note form
- Patient appointment detail
- Admin appointment search
- Advanced filters
- Pagination
- Loading, error and empty states

---

# Source Requirements

The project requirements define the following:

## Must

- Patients can filter appointments by date range and status.
- Doctors can only access appointments for their own slots.
- Patients can only access their own appointments.
- Roles must be enforced.

## Should

- Prescriptions attached to completed appointments.
- Medical history notes that are patient-scoped and doctor-authored.
- Admin hospital-wide appointment search.

The implementation must preserve these requirements.

---

# PART 1 — Appointment Access by Role

The same appointment resource must return data according to the authenticated role.

---

## Patient Access

Patient can:

- View only their own appointments.
- Filter their own appointments.
- View appointment details.
- See appointment status.
- See doctor information.
- See slot date and time.
- See patient-appropriate prescription summary if applicable.

Patient cannot:

- Access another patient's appointment.
- Modify another patient's data.
- Access internal medical notes.
- Access admin search results.

Never trust:
`patientId` from query parameters for patient requests. Automatically enforce `patientId = req.user.id`.

---

## Doctor Access

Doctor can:

- View appointments linked to slots belonging to their own doctor profile.
- Filter their own appointments by status and date range.
- View clinical details of their appointments.
- Document visit completion (`COMPLETED` status).
- Write medical history notes for their appointments.
- Issue prescriptions for completed appointments.

Doctor cannot:

- Access appointments of other doctors.
- Modify appointments belonging to other doctors.
- Perform admin hospital-wide patient/doctor management.

Enforcement:
Derive doctor ID from `DoctorProfile` associated with authenticated user (`userId = req.user.id`).

---

## Admin Access

Admin can:

- Perform hospital-wide appointment search across all doctors, patients, dates, and statuses.
- Search appointments by patient name/email, doctor name/specialization, or appointment reason.
- Filter appointments by `patientId`, `doctorId`, `status`, `dateFrom`, and `dateTo`.
- View complete details of any appointment including prescription and medical notes.
- Paginate and sort hospital-wide appointment records.

---

# PART 2 — Clinical Workflow: Appointment Completion, Prescriptions & Medical Notes

## Appointment Completion Workflow

- Status transition: `SCHEDULED` → `COMPLETED`.
- Can only be initiated by the assigned Doctor or an Admin.
- Transactionally records optional **Prescription** (`medicines`, `instructions`) and optional **Medical Note** (`notes`).
- Appointment cannot be marked completed if already `CANCELLED` or already `COMPLETED`.

## Prescriptions

- Attached 1:1 to an appointment.
- Contains structured medicines (`name`, `dosage`, `frequency`, `duration`) and text `instructions`.
- Accessible by Patient (their own), Doctor (their own), and Admin.

## Medical Notes

- Clinical consultation notes authored by Doctor for an appointment.
- Patient-scoped and doctor-authored.
- **Internal to medical staff**: Confidential notes NOT visible to patient views.

---

# PART 3 — Hospital-Wide Appointment Search & Advanced Filtering

- Query parameter `q`: Case-insensitive search on patient/doctor name, email, or appointment reason.
- Query parameters `dateFrom` & `dateTo`: Filter by appointment slot start and end dates.
- Query parameter `status`: Filter by `SCHEDULED`, `COMPLETED`, or `CANCELLED`.
- Pagination: `page` (default 1), `limit` (default 20/50).
- Sorting: `startsAt` (default DESC) or `createdAt`.

---

# PART 4 — Acceptance Criteria

- Doctor appointment list & detail views work with strict doctor slot scoping.
- Patient appointment views display only patient's own appointments and patient-safe prescriptions.
- Admin appointment search permits hospital-wide searching, filtering, sorting, and pagination.
- Appointment completion workflow works seamlessly with prescription and medical note creation.
- Role-based security is strictly enforced on backend endpoints.
- No TypeScript or ESLint errors across monorepo workspace.
