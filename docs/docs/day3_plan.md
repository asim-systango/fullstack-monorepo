# Day 3 Implementation Plan — Authentication, Authorization & Role Based Access Control

## Overview & Objective

Day 1 and Day 2 established the monorepo foundation, database architecture, TypeORM entities, repositories, domain services, and core frontend layout components.
The goal for **Day 3** is to implement an enterprise-grade, secure, and production-ready **Authentication, Authorization & Role-Based Access Control (RBAC)** system across backend (`apps/api` and `apps/api-gateway`), frontend (`apps/web`), and technical documentation (`docs/docs`).

By the end of Day 3, all backend protected endpoints and Next.js frontend routes will be properly guarded against unauthorized access and role violations.

---

## Architectural & Coding Rules (Derived from `/docs` & `day3.md`)

1. **Enterprise Password & Token Security**: Never store plain passwords or plain refresh tokens. Passwords hashed using `bcrypt` with 12 salt rounds. Refresh tokens hashed in DB.
2. **Role Hierarchy**: System supports three explicit roles: `ADMIN`, `DOCTOR`, and `PATIENT`.
3. **Token Management**:
   - Access Token: 15 minutes expiration.
   - Refresh Token: 7 days expiration (stored hashed in user database table).
4. **Backend Route Protection**: Global `JwtAuthGuard` and `RolesGuard` registered with `@Public()` decorator bypass for public endpoints (`/auth/login`, `/auth/register`).
5. **Frontend State & Axios Interceptors**:
   - Store auth state (user, tokens/status, role) in frontend store/context.
   - Configure Axios request/response interceptors to attach `Authorization: Bearer <token>` and automatically perform token refreshing on 401 response.
6. **Dynamic Role-Based Navigation**:
   - Navigation links in `Sidebar` dynamically render based on logged-in user role (`ADMIN`, `DOCTOR`, `PATIENT`).
   - Header displays logged-in user profile, avatar, role badge, and logout action.
7. **Protected Frontend Routes**:
   - Patient routes: `/dashboard`, `/appointments`
   - Doctor routes: `/doctor`, `/doctor/schedule`
   - Admin routes: `/admin`, `/admin/users`, `/admin/appointments`
8. **Zero Shortcuts**: Strict TypeScript types, zero `any`, proper OWASP recommendations, complete validation DTOs, and full Swagger documentation.

---

## Phase 1: Backend Auth Infrastructure & Database (`apps/api` & `apps/api-gateway`)

### 1. User Entity & Database Schema (`User` Entity)

- **Entity Schema**:
  - `id`: UUID (Primary Key)
  - `email`: string (UNIQUE, indexed)
  - `passwordHash`: string (bcrypt hash)
  - `firstName`: string (min 2, max 50)
  - `lastName`: string (min 2, max 50)
  - `phone`: string (UNIQUE, indexed)
  - `role`: Enum (`ADMIN`, `DOCTOR`, `PATIENT`)
  - `isActive`: boolean (default `true`)
  - `emailVerified`: boolean (default `false`)
  - `hashedRefreshToken`: string (nullable)
  - `createdAt`, `updatedAt`, `deletedAt`: timestamptz
- **Relationships**:
  - `DoctorProfile`: 1:1 relationship via `userId`
  - `Appointment`: 1:N relationship via `patientId`

### 2. NestJS Auth Module, Strategies & Guards

- **Module Composition**:
  - `AuthModule`: Imports `JwtModule`, `PassportModule`, `UsersModule`
  - `AuthController`: Exposes authentication REST endpoints
  - `AuthService`: Implements registration, credential verification, JWT signing, refresh token rotation, logout
- **Strategies & Guards**:
  - `JwtStrategy`: Validates Access Token header/cookie and extracts `JwtUser` payload
  - `RefreshTokenStrategy` / `RefreshTokenGuard`: Validates Refresh Token during rotation
  - `RolesGuard`: Enforces `@Roles(Role.ADMIN, ...)` access restrictions
  - `@CurrentUser()` Decorator: Extracts typed authenticated user from execution context
  - `@Public()` Decorator: Bypasses authentication guards for open routes

### 3. Auth REST Endpoints

- `POST /auth/register`: Public. Accepts Patient registration payload (`email`, `password`, `firstName`, `lastName`, `phone`).
- `POST /auth/login`: Public. Validates credentials, returns Access Token, Refresh Token, and User profile.
- `POST /auth/refresh`: Public with valid Refresh Token. Rotates and issues new Access Token.
- `POST /auth/logout`: Protected. Invalidates refresh token and clears session.
- `GET /auth/profile` / `GET /auth/me`: Protected. Returns current logged-in user profile.

### 4. Database Migration & Seed Data

- Generate migration for `User` entity update/creation with role enum (`ADMIN`, `DOCTOR`, `PATIENT`).
- Update `seed.ts` to insert 3 initial system accounts with hashed passwords (`bcrypt` 12 rounds):
  - Admin: `admin@hospital.com` / `Admin@123` (Role: `ADMIN`)
  - Doctor: `doctor2@hospital.com` / `Doctor@123` (Role: `DOCTOR`)
  - Patient: `patient@hospital.com` / `Patient@123` (Role: `PATIENT`)

---

## Phase 2: Frontend Auth & Protection Architecture (`apps/web`)

### 1. Auth Feature Structure (`apps/web/features/auth`)

- `types/auth.ts`: Auth interfaces (`User`, `Role`, `LoginPayload`, `RegisterPayload`, `AuthResponse`, `TokenPair`).
- `validators/auth.ts`: Zod validation schemas for Login and Registration forms.
- `services/auth.ts`: API service functions for login, register, refresh, logout, profile fetch.
- `hooks/use-auth.ts`: TanStack Query hooks (`useLogin`, `useRegister`, `useLogout`, `useCurrentUser`).
- `store/use-auth-store.ts`: Auth state management (user, accessToken, isAuthenticated, role checks).

### 2. Axios Request/Response Interceptors

- Attach Access Token in `Authorization: Bearer <token>` header for API requests.
- Handle 401 Unauthorized responses: attempt token refresh via `/auth/refresh`. If refresh succeeds, retry failed request; if refresh fails, wipe local auth state and redirect to `/login`.

### 3. Authentication UI Pages & Components

- `/login` Page: Modern glassmorphism card, Email & Password input fields, Remember Me checkbox, submit button with loading state, validation feedback.
- `/register` Page: Patient registration form (First Name, Last Name, Email, Phone, Password, Confirm Password) with full Zod validation.
- `UnauthorizedPage` & `403` / `404` Page fallbacks: Clean UI error pages when access is restricted.

### 4. Navigation & Layout Integration

- **Sidebar**: Dynamic menu rendering based on logged-in user role:
  - `PATIENT`: Doctors, Appointments, Profile
  - `DOCTOR`: Dashboard, Schedule, Appointments, Profile
  - `ADMIN`: Dashboard, Doctors, Users, Appointments, Settings
- **Header**: Active user name, role badge (`ADMIN`, `DOCTOR`, `PATIENT`), avatar fallback, logout button, and theme switcher.

---

## Phase 3: Documentation Updates (`docs/docs/`)

- **`AUTHENTICATION.md`**: Update sequence diagrams, JWT payload structure, refresh token storage, and password hashing standard.
- **`RBAC.md`**: Document exact permissions matrix for `ADMIN`, `DOCTOR`, and `PATIENT` roles across all routes and API endpoints.
- **`API_CONTRACT.md`**: Add `/auth/*` endpoint specs, request body schemas, response envelopes, error HTTP codes.
- **`Architecture.md`**: Document auth guard lifecycle, token rotation pattern, and frontend store integration.

---

## Phase 4: Verification & Quality Assurance

1. Workspace type checking: `pnpm typecheck` (0 errors).
2. Workspace linting: `pnpm lint` and `pnpm lint:sonar` (0 errors).
3. Database migration & seed verification: `pnpm migration:run:api` & `pnpm seed`.
4. Automated unit tests: `pnpm test`.
