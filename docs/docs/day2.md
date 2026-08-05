# Hospital Appointment System

# DAY 02 — Database Modeling & Domain Foundation

> Goal:
> Today we will build the complete database foundation of the Hospital Appointment System.
>
> We are NOT implementing business logic yet.
>
> We are creating production-ready entities, relationships, migrations, DTOs, repositories, and CRUD APIs that will be used during the rest of the project.

---

# Role

You are a Senior Backend Engineer with 10+ years of experience building scalable healthcare systems using NestJS, PostgreSQL, and TypeORM.

Write production-quality code.

Never generate placeholder implementations.

Follow NestJS best practices.

---

# Tech Stack

Backend

- NestJS
- PostgreSQL
- TypeORM
- TypeScript
- class-validator
- class-transformer

Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- ShadCN UI
- TanStack Query

---

# Today's Objective

Implement the complete database layer.

By the end of today we should have

✅ Database schema

✅ Entity relationships

✅ TypeORM migrations

✅ DTO validation

✅ CRUD APIs

✅ Swagger documentation

✅ Repository layer

NO booking logic.

NO transactions.

NO authentication logic.

NO authorization logic.

---

# Domain Model

Implement the following entities.

---

## DoctorProfile

Fields

- id
- userId
- firstName
- lastName
- specialization
- qualification
- experienceYears
- consultationFee
- biography
- profileImage
- isActive
- createdAt
- updatedAt
- deletedAt

Relationship

User (1:1)

DoctorProfile (1:N Slot)

Indexes

userId UNIQUE

specialization INDEX

---

## Slot

Fields

- id
- doctorId
- startsAt
- endsAt
- status
- createdAt
- updatedAt

Status Enum

AVAILABLE

BOOKED

BLOCKED

Relationship

DoctorProfile (1:N)

Appointment (1:1)

Constraints

startsAt < endsAt

---

## Appointment

Fields

- id
- patientId
- slotId
- status
- reason
- createdAt
- updatedAt
- deletedAt

Status Enum

SCHEDULED

CANCELLED

COMPLETED

Relationship

Slot (1:1)

Prescription (1:1)

MedicalNote (1:N)

Indexes

patientId

status

slotId UNIQUE

---

## Prescription

Fields

- id
- appointmentId
- medicines
- instructions
- createdAt
- updatedAt

Relationship

Appointment (1:1)

---

## MedicalNote

Fields

- id
- appointmentId
- doctorId
- notes
- createdAt

Relationship

Appointment (ManyToOne)

DoctorProfile (ManyToOne)

---

# TypeORM Requirements

Use

PrimaryGeneratedColumn("uuid")

CreateDateColumn()

UpdateDateColumn()

DeleteDateColumn()

Index()

Unique()

Check()

Proper Foreign Keys

Lazy loading should NOT be used.

Prefer eager only where appropriate.

---

# Migration Requirements

Generate migrations only.

Do NOT use synchronize:true.

Migration should create

DoctorProfile

Slot

Appointment

Prescription

MedicalNote

Include

Foreign Keys

Unique Constraints

Indexes

Check Constraints

---

# DTO Validation

Create DTOs for

Doctor

Slot

Appointment

Prescription

MedicalNote

Validation Rules

Use

class-validator

Examples

First Name

Required

Minimum 2 characters

Maximum 50

Specialization

Required

Experience

Minimum 0

Fee

Positive number

Date

Must be ISO Date

Appointment Reason

Maximum 500 characters

---

# Repository Layer

Create repositories

DoctorRepository

SlotRepository

AppointmentRepository

PrescriptionRepository

MedicalNoteRepository

Repository responsibilities

- Database operations only
- No business logic
- No validation
- Reusable methods

---

# Service Layer

Implement CRUD only.

Doctor

Create

Update

Delete (Soft Delete)

Get One

Get All

Slot

Create

Update

Delete

Get One

Get All

Prescription

CRUD

Medical Notes

CRUD

Appointment

CRUD only

No booking validation.

No transactions.

---

# Controller Layer

Expose REST endpoints.

Doctor

GET /doctors

GET /doctors/:id

POST /doctors

PATCH /doctors/:id

DELETE /doctors/:id

---

Slot

GET /slots

GET /slots/:id

POST /slots

PATCH /slots/:id

DELETE /slots/:id

---

Appointment

GET /appointments

GET /appointments/:id

POST /appointments

PATCH /appointments/:id

DELETE /appointments/:id

---

Prescription

CRUD

---

Medical Notes

CRUD

---

# Swagger

Every endpoint must contain

@ApiTags

@ApiOperation

@ApiResponse

@ApiBearerAuth where required later

Swagger models should correctly display DTOs.

---

# Exception Handling

Use

NotFoundException

BadRequestException

ConflictException

InternalServerErrorException

No generic Error.

---

# Logging

Use NestJS Logger.

Log

Create

Update

Delete

Failures

---

# API Response Structure

Every API should return

Success

{
  "success": true,
  "message": "...",
  "data": {}
}

Failure

{
  "success": false,
  "message": "...",
  "errors": []
}

Use a global response interceptor if already configured.

---

# Frontend Tasks

Generate pages

/doctors

/doctor/[id]

/appointments

Create reusable components

DoctorCard

DoctorTable

SlotCard

AppointmentCard

EmptyState

LoadingSkeleton

ErrorState

No real API integration yet.

Use mocked data.

Create TypeScript interfaces matching backend entities.

Create API service files with placeholder methods.

Create TanStack Query hooks.

Structure

features/

doctor/

appointment/

slot/

services/

hooks/

types/

---

# Seed Data

Generate seed scripts.

Insert

3 Doctors

12 Slots

4 Appointments

2 Prescriptions

5 Medical Notes

Dates should be realistic.

---

# Folder Structure

Maintain clean architecture.

src

modules

doctor

controllers

services

repositories

dto

entities

slot

appointment

prescription

medical-note

common

database

shared

---

# Deliverables

Backend

✔ Entities complete

✔ Relationships complete

✔ UUID primary keys

✔ Migrations generated

✔ DTO validation

✔ CRUD APIs

✔ Swagger working

✔ Repository layer

✔ Services

✔ Controllers

✔ Seed script

Frontend

✔ Mock pages

✔ Mock components

✔ Type-safe models

✔ API service structure

✔ Query hooks

✔ Responsive UI

✔ Loading states

✔ Empty states

Documentation

Update

ERD.md

DATABASE_DESIGN.md

API_CONTRACT.md

Add today's completed work.

---

# Acceptance Criteria

Project builds successfully.

No TypeScript errors.

No ESLint errors.

Migration runs successfully.

Database tables created.

CRUD APIs work.

Swagger documents all APIs.

Frontend compiles successfully.

Responsive layouts work.

Mock data renders correctly.

No placeholder TODOs remain.

---

# Important

Today's work is only the database and CRUD foundation.

Do NOT implement

❌ Authentication

❌ Role Guards

❌ Booking transaction

❌ Slot reservation

❌ Concurrency handling

❌ Authorization

Those will be implemented on Day 3 and Day 4.

Always write clean, maintainable, production-ready code following SOLID principles and NestJS best practices.