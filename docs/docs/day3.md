# Hospital Appointment System

# DAY 03 — Authentication, Authorization & Role Based Access Control

> Goal:
>
> Build a secure authentication system that supports Admin, Doctor, and Patient roles.
>
> By the end of today every protected endpoint and frontend route should be secured.

---

# Your Role

You are a Senior Software Engineer designing an authentication system for a production healthcare platform.

The authentication system should be scalable, secure and follow enterprise best practices.

Never write shortcut implementations.

Follow NestJS best practices.

Follow OWASP recommendations.

---

# Tech Stack

Backend

- NestJS
- JWT
- Passport
- bcrypt
- PostgreSQL
- TypeORM

Frontend

- Next.js 15
- App Router
- TypeScript
- TanStack Query
- Redux Toolkit
- React Hook Form
- Zod
- Axios

---

# Today's Goal

Implement

✅ Authentication

✅ Authorization

✅ JWT

✅ Refresh Tokens

✅ Password Hashing

✅ Current User

✅ Roles

✅ Route Guards

✅ Frontend Login

✅ Protected Routes

Do NOT implement booking logic.

Do NOT implement transactions.

---

# User Roles

The system has three roles.

ADMIN

Permissions

- Manage doctors
- View all appointments
- Manage system

-------------------------

DOCTOR

Permissions

- View own appointments
- Manage own slots
- Create prescriptions
- Create medical notes

Cannot

- Access admin routes

-------------------------

PATIENT

Permissions

- Browse doctors
- Book appointments
- Cancel own appointments
- View own appointments

Cannot

- View others' appointments

---

# Database Changes

Create User entity.

Fields

id

email

password

firstName

lastName

phone

role

isActive

emailVerified

createdAt

updatedAt

deletedAt

Role Enum

ADMIN

DOCTOR

PATIENT

Indexes

email UNIQUE

phone UNIQUE

Relationship

DoctorProfile

1:1

Appointment

1:N

---

# Authentication Module

Generate

AuthModule

AuthController

AuthService

JwtStrategy

JwtGuard

LocalStrategy

RefreshTokenStrategy

RolesGuard

CurrentUser Decorator

Roles Decorator

---

# Password Security

Use bcrypt.

Never store plain passwords.

Hash

12 salt rounds.

Never return password in any API response.

---

# JWT Configuration

Generate

Access Token

Expiration

15 minutes

Refresh Token

Expiration

7 days

Store refresh token hashed.

Never store plain refresh token.

---

# Authentication APIs

POST

/auth/register

Patient registration

----------------------

POST

/auth/login

Returns

Access Token

Refresh Token

User

----------------------

POST

/auth/refresh

Generate new Access Token

----------------------

POST

/auth/logout

Invalidate Refresh Token

----------------------

GET

/auth/profile

Returns current logged-in user.

Protected.

---

# Validation

Registration

Email

Valid

Unique

Password

Minimum

8 characters

Must contain

Uppercase

Lowercase

Number

Special Character

Phone

Valid

Unique

Names

Minimum

2

Maximum

50

---

# JWT Payload

Keep payload small.

Include

sub

email

role

Never include password.

---

# Authorization

Implement

@Roles()

Decorator

Supported Roles

ADMIN

DOCTOR

PATIENT

Example

@Roles(Role.ADMIN)

Guard should reject unauthorized users.

Return

403

Forbidden

---

# Current User Decorator

Create

@CurrentUser()

Should inject

User Entity

Example

@Get("profile")

profile(@CurrentUser() user)

---

# Global Guards

Configure

JwtAuthGuard

RolesGuard

Public Decorator

Endpoints

/login

/register

remain public.

Everything else protected.

---

# Exception Handling

401

Unauthorized

Invalid Token

Expired Token

403

Forbidden

Wrong Role

404

User Not Found

409

Duplicate Email

400

Validation Errors

---

# Seed Data

Create

Admin

doctor@hospital.com

password

Doctor@123

----------------------

Patient

patient@hospital.com

password

Patient@123

----------------------

Doctor

doctor2@hospital.com

password

Doctor@123

Passwords should be hashed.

---

# Swagger

Support

JWT Authentication

Authorize Button

Document every endpoint.

---

# Frontend Authentication

Implement

Authentication Flow

Pages

/login

/register

Dashboard Redirect

Logout

Forgot Password Placeholder

Unauthorized Page

403 Page

404 Page

---

# Authentication UI

Login Form

Email

Password

Remember Me

Validation

Loading Button

Error Messages

Responsive

------------------------

Register Form

First Name

Last Name

Phone

Email

Password

Confirm Password

Validation

Responsive

---

# Frontend Architecture

Create

features/auth

components/auth

hooks/auth

services/auth

types/auth

validators/auth

store/auth

providers/auth

---

# Axios

Configure

Axios Instance

Base URL

Authorization Header

Request Interceptor

Response Interceptor

Refresh Token Flow

401 Retry Logic

Logout on Refresh Failure

---

# Redux

Store

Current User

Access Token

Loading

Authentication State

Permissions

Selectors

Actions

Login

Logout

Update User

Refresh Token

---

# TanStack Query

Create Hooks

useLogin

useRegister

useLogout

useCurrentUser

useRefreshToken

---

# Route Protection

Public Routes

/

/login

/register

Protected

/dashboard

/appointments

Doctor Only

/doctor

/doctor/schedule

Admin Only

/admin

/admin/users

/admin/appointments

Redirect unauthorized users.

---

# Sidebar

Dynamic Navigation

Patient

Doctors

Appointments

Profile

Doctor

Dashboard

Schedule

Appointments

Profile

Admin

Dashboard

Doctors

Users

Appointments

Settings

Menus should depend on role.

---

# Header

Display

User Name

Avatar

Role

Notifications Placeholder

Logout

Theme Switch

---

# Backend Deliverables

✔ User Entity

✔ Auth Module

✔ JWT Authentication

✔ Refresh Tokens

✔ Password Hashing

✔ Guards

✔ Decorators

✔ Swagger JWT

✔ Seed Users

✔ Role Protection

---

# Frontend Deliverables

✔ Login Page

✔ Register Page

✔ Auth Context

✔ Redux Auth

✔ Axios

✔ Protected Routes

✔ Role Based Sidebar

✔ User Menu

✔ Logout

✔ Responsive

---

# Documentation

Update

AUTHENTICATION.md

RBAC.md

API_CONTRACT.md

ARCHITECTURE.md

Document

Authentication Flow

JWT Flow

Role Matrix

Refresh Token Flow

Security Decisions

Folder Structure

---

# Acceptance Criteria

User can register.

User can login.

JWT works.

Refresh token works.

Protected APIs reject unauthorized users.

Role protected routes reject wrong roles.

Passwords are hashed.

Swagger Authorize button works.

Frontend stores tokens.

Frontend redirects correctly.

Sidebar changes based on role.

No TypeScript errors.

No ESLint errors.

Production-ready code only.

---

# Important

Today's focus is Authentication and Authorization only.

Do NOT implement

❌ Booking

❌ Transactions

❌ Slot Reservation

❌ Concurrency

❌ Prescriptions

❌ Medical Notes

These will be implemented on Day 4 and Day 5.

Every class, DTO, controller, service and hook should be clean, documented and follow SOLID principles.

Generate enterprise-quality code suitable for a production healthcare application.