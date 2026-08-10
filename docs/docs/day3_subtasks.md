# Day 3 Subtask Checklist — Authentication, Authorization & Role Based Access Control

## Legend

- [ ] Pending
- [x] Completed

---

## 1. Backend Auth & Role Access Tasks (`apps/api` & `apps/api-gateway`)

### Database & User Entity (`apps/api-gateway` / `apps/api`)

- [ ] Task 1.1: Verify/Update `User` entity with `firstName`, `lastName`, `email`, `phone`, `passwordHash`, `role` (`ADMIN` | `DOCTOR` | `PATIENT`), `isActive`, `emailVerified`, `hashedRefreshToken`, `createdAt`, `updatedAt`, `deletedAt`.
- [ ] Task 1.2: Enforce unique indexes on `email` and `phone` columns.
- [ ] Task 1.3: Update TypeORM DataSources and verify migrations.

### NestJS Auth Core & Strategies

- [ ] Task 1.4: Configure `AuthModule`, `AuthController`, and `AuthService`.
- [ ] Task 1.5: Implement `JwtStrategy` and `JwtAuthGuard` supporting Bearer JWT authentication.
- [ ] Task 1.6: Implement `RefreshTokenStrategy` and refresh token rotation logic in `AuthService`.
- [ ] Task 1.7: Implement `@Roles(...)` decorator and `RolesGuard` for role restriction enforcement (`ADMIN`, `DOCTOR`, `PATIENT`).
- [ ] Task 1.8: Implement `@CurrentUser()` decorator to inject authenticated user profile.
- [ ] Task 1.9: Implement `@Public()` decorator to allow unauthenticated route access on register/login endpoints.

### Authentication APIs & Swagger

- [ ] Task 1.10: Implement `POST /auth/register` with DTO validation (email, password strength, name lengths, phone format).
- [ ] Task 1.11: Implement `POST /auth/login` returning Access Token (15m), Refresh Token (7d), and user payload.
- [ ] Task 1.12: Implement `POST /auth/refresh` to rotate refresh tokens and issue fresh access tokens.
- [ ] Task 1.13: Implement `POST /auth/logout` to clear refresh token in database/cookie.
- [ ] Task 1.14: Implement `GET /auth/profile` (`/auth/me`) returning currently authenticated user profile.
- [ ] Task 1.15: Annotate all Auth controller endpoints with Swagger OpenAPI decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`).

### Seeding Accounts

- [ ] Task 1.16: Update `seed.ts` script to populate hashed seed accounts: Admin (`admin@hospital.com`), Doctor (`doctor2@hospital.com`), Patient (`patient@hospital.com`).

---

## 2. Frontend Auth & Dynamic Role Navigation (`apps/web`)

### Auth Domain Architecture (`apps/web/features/auth`)

- [ ] Task 2.1: Define TypeScript types (`User`, `UserRole`, `LoginPayload`, `RegisterPayload`, `AuthResponse`) in `features/auth/types`.
- [ ] Task 2.2: Build Zod validation schemas (`loginSchema`, `registerSchema`) in `features/auth/validators`.
- [ ] Task 2.3: Implement API auth services (`login`, `register`, `refreshToken`, `logout`, `fetchProfile`) in `features/auth/services`.
- [ ] Task 2.4: Implement Auth Store / Zustand slice for managing token, user session, and role state.
- [ ] Task 2.5: Implement TanStack Query hooks (`useLogin`, `useRegister`, `useLogout`, `useCurrentUser`).

### Interceptors & Protection

- [ ] Task 2.6: Configure Axios / ApiClient interceptor to inject `Authorization: Bearer <token>`.
- [ ] Task 2.7: Implement 401 response interceptor for automatic refresh token retries.
- [ ] Task 2.8: Create client-side route guard / page wrapper enforcing role permissions on `/admin/*`, `/doctor/*`, and `/appointments`.

### Authentication UI Pages

- [ ] Task 2.9: Build `/login` page with email/password validation, error alerts, loading state, and dashboard redirect.
- [ ] Task 2.10: Build `/register` page with patient details form, password confirmation, validation, and login redirect.
- [ ] Task 2.11: Create `403 Forbidden` and `Unauthorized` page fallbacks.

### Navigation & Header Integration

- [ ] Task 2.12: Update `Sidebar` component to render dynamic navigation menus matching logged-in user role (`ADMIN`, `DOCTOR`, `PATIENT`).
- [ ] Task 2.13: Update `Header` component to render active user's name, role badge, avatar fallback, theme switcher, and logout trigger.

---

## 3. Technical Documentation (`docs/docs/`)

- [ ] Task 3.1: Update `docs/docs/AUTHENTICATION.md` with JWT & Refresh token lifecycle, hashing policy, and sequence flow.
- [ ] Task 3.2: Update `docs/docs/RBAC.md` with role-permission matrix (`ADMIN`, `DOCTOR`, `PATIENT`).
- [ ] Task 3.3: Update `docs/docs/API_CONTRACT.md` with `/auth/*` specifications, body schemas, and HTTP error codes.
- [ ] Task 3.4: Update `docs/docs/Architecture.md` with Auth Guards and token rotation details.

---

## 4. Verification & Quality Assurance

- [ ] Task 4.1: Run `pnpm typecheck` across all monorepo workspace packages.
- [ ] Task 4.2: Run `pnpm lint` and `pnpm lint:sonar` ensuring 0 warnings and 0 errors.
- [ ] Task 4.3: Run `pnpm seed` to verify DB seeding of hashed accounts.
- [ ] Task 4.4: Run unit tests with `pnpm test`.
