# Hospital Appointment System

# DAY 04 — Appointment Booking Engine, Transactions & Slot Management

> Goal:
>
> Today we are implementing the core business logic of the Hospital Appointment System.
>
> This is the most critical day of the project.
>
> The system must guarantee that no slot can ever be double-booked.
>
> Every booking and cancellation must be fully transactional and maintain database consistency.

---

# Your Role

You are a Principal Backend Engineer with 15+ years of experience designing healthcare and financial systems where data consistency is critical.

Write production-ready code.

Never sacrifice correctness for simplicity.

Use enterprise design principles.

---

# Tech Stack

Backend

- NestJS
- PostgreSQL
- TypeORM
- QueryRunner Transactions
- Pessimistic Locking
- JWT
- Passport

Frontend

- Next.js 15
- TanStack Query
- React Hook Form
- ShadCN UI
- Redux Toolkit

---

# Today's Objective

Implement

✔ Slot Management

✔ Appointment Booking

✔ Appointment Cancellation

✔ Database Transactions

✔ Concurrency Protection

✔ Ownership Validation

✔ Business Rules

✔ Frontend Booking Flow

---

# Important Rules

Patients can ONLY book appointments for themselves.

Never trust patientId from request body.

Always use

Current Logged In User

from JWT.

---

# Booking Workflow

Booking Flow

Patient

↓

Select Doctor

↓

View Available Slots

↓

Choose Slot

↓

Confirm Booking

↓

Transaction Starts

↓

Lock Slot

↓

Validate Slot

↓

Create Appointment

↓

Update Slot Status

↓

Commit Transaction

↓

Return Success

---

# Cancellation Workflow

Patient

↓

Open Appointment

↓

Click Cancel

↓

Confirmation Dialog

↓

Transaction Starts

↓

Update Appointment Status

↓

Free Slot

↓

Commit

↓

Return Success

---

# Slot Entity

Implement

Status Enum

AVAILABLE

BOOKED

BLOCKED

Slot should never become

BOOKED

without an appointment.

---

# Appointment Entity

Status Enum

SCHEDULED

CANCELLED

COMPLETED

Cancellation should NOT hard delete.

Use Soft Delete.

---

# Booking API

POST

/appointments

Body

slotId

reason

PatientId must come from JWT.

Never from request body.

---

# Booking Validation

Reject if

Slot does not exist

Slot already booked

Slot blocked

Slot in past

Doctor inactive

Duplicate booking

Patient inactive

Return

409

Conflict

for already booked slots.

---

# Transaction Requirements

Use

QueryRunner

OR

DataSource.transaction()

Transaction Steps

Start

↓

Lock Slot

↓

Validate

↓

Create Appointment

↓

Update Slot

↓

Commit

Rollback

if any failure occurs.

Never leave inconsistent data.

---

# Concurrency

Two users book same slot.

Expected

Patient A

Success

Patient B

409 Conflict

Implement

Pessimistic Write Lock

OR

SELECT FOR UPDATE

Document why.

---

# Cancellation API

DELETE

/appointments/:id

Rules

Patient can cancel ONLY own appointment.

Cannot cancel others.

Cannot cancel completed appointment.

Cannot cancel already cancelled appointment.

Transaction

↓

Update Appointment

↓

Update Slot

↓

Commit

---

# Doctor Slot APIs

GET

/doctors/:id/slots

Return

Only AVAILABLE slots

Future only

Sorted by date

---

Doctor

POST

/slots

Doctor creates slot.

Validation

End > Start

30 minute duration

Future only

No overlapping slots

---

PATCH

/slots/:id

Allow

BLOCK

UNBLOCK

Update

Delete unused slots

Cannot delete booked slots.

---

# Ownership Rules

Patient

Only own appointments

Doctor

Only own slots

Admin

Everything

Never expose another patient's data.

---

# Filtering

Appointments

GET

/appointments

Support

status

dateFrom

dateTo

doctorId

Pagination

page

limit

Sort

createdAt

appointmentDate

---

# Query Builder

Implement optimized queries.

Avoid N+1 problems.

Select only required columns.

Add pagination.

---

# Database Indexes

Appointment

patientId

status

slotId

Slot

doctorId

startsAt

status

DoctorProfile

specialization

---

# Error Handling

400

Invalid slot

401

Unauthorized

403

Booking another patient's appointment

404

Slot not found

409

Slot already booked

422

Business rule violation

---

# Swagger

Document

Booking

Cancellation

Slot APIs

Examples

Responses

Validation

---

# Logging

Log

Booking Success

Booking Failure

Cancellation

Doctor Slot Creation

Blocked Slot

Include

User ID

Slot ID

Appointment ID

---

# Frontend Tasks

Implement

Doctor Listing

Doctor Details

Available Slots

Booking Modal

Confirmation Dialog

Appointment List

Cancel Dialog

Loading States

Error States

Empty States

---

# Pages

/doctors

/doctors/[id]

/appointments

---

# Components

DoctorCard

DoctorProfile

SlotList

SlotCard

BookingModal

CancelDialog

AppointmentCard

StatusBadge

Pagination

FilterBar

---

# TanStack Query

Hooks

useDoctors()

useDoctor()

useAvailableSlots()

useBookAppointment()

useAppointments()

useCancelAppointment()

Automatic Cache Invalidation

Refetch after booking

Refetch after cancellation

---

# UI Behaviour

Booking

Click Slot

↓

Confirmation

↓

Loading

↓

Success Toast

↓

Redirect

Appointments Page

Cancellation

Confirm

↓

Loading

↓

Toast

↓

Refresh List

---

# API Integration

Replace all mock data.

Connect every screen to backend.

Handle

401

403

404

409

Gracefully.

---

# Seed Data

Generate

3 Doctors

20 Future Slots

6 Appointments

Mix

Booked

Available

Blocked

Cancelled

Completed

---

# Documentation

Update

API_CONTRACT.md

DATABASE_DESIGN.md

ARCHITECTURE.md

Document

Booking Flow

Transaction Flow

Sequence Diagram

Concurrency Handling

Locking Strategy

Ownership Validation

---

# Acceptance Criteria

✔ Booking works

✔ Cancellation works

✔ Transactions implemented

✔ Slot automatically booked

✔ Slot automatically freed

✔ Double booking impossible

✔ Proper HTTP status codes

✔ Pagination works

✔ Filters work

✔ Frontend integrated

✔ Responsive UI

✔ No TypeScript errors

✔ No ESLint errors

✔ Swagger updated

✔ Production-ready implementation

---

# Things NOT to Build Today

❌ Prescriptions

❌ Medical Notes

❌ Analytics Dashboard

❌ Notifications

❌ Email

❌ Redis Queue

Those belong to Day 5 and Day 6.

---

# Code Quality Rules

- Follow SOLID Principles.
- Use Repository Pattern.
- Keep controllers thin.
- Business logic belongs only in services.
- Use DTOs for every request.
- Validate all inputs.
- Never duplicate logic.
- Write reusable services.
- Prefer composition over duplication.
- Add meaningful comments only where business logic is non-obvious.
- Keep code production-ready and maintainable.

The final implementation should resemble enterprise healthcare software and be suitable for production deployment.