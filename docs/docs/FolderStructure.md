# Folder Structure Documentation

```
fullstack-monorepo/
├── apps/
│   ├── api-gateway/                    # NestJS BFF — Auth, Users, JWT cookies
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/               # Login, register, refresh token, JWT strategies
│   │       │   ├── health/             # Health check endpoint
│   │       │   └── users/              # users table + hospital_admins table
│   │       │       ├── user.entity.ts          # All roles: ADMIN | DOCTOR | PATIENT
│   │       │       └── hospital-admin.entity.ts # Extended profile for ADMIN users
│   │       ├── common/                 # Auth guards, decorators, interceptors
│   │       ├── config/                 # Database & JWT config
│   │       ├── database/
│   │       │   ├── data-source.ts      # TypeORM CLI config (migrations ledger: "migrations")
│   │       │   ├── migrations/         # Gateway DB migrations
│   │       │   └── seed.ts             # Seeds initial ADMIN user
│   │       ├── app.module.ts
│   │       └── main.ts
│   │
│   ├── api/                            # NestJS Domain API — Clinical business logic
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── doctor/             # doctor_profiles table
│   │       │   │   ├── entities/doctor-profile.entity.ts
│   │       │   │   ├── repositories/
│   │       │   │   ├── dto/
│   │       │   │   ├── doctor.service.ts
│   │       │   │   └── doctor.controller.ts
│   │       │   ├── patient/            # patient_profiles table  ← NEW (Aug 2026)
│   │       │   │   ├── entities/patient-profile.entity.ts
│   │       │   │   ├── patient.service.ts
│   │       │   │   └── patient.controller.ts
│   │       │   ├── slot/               # slots table
│   │       │   ├── appointment/        # appointments table
│   │       │   ├── prescription/       # prescriptions table
│   │       │   └── medical-note/       # medical_notes table
│   │       ├── shared/
│   │       │   └── entities/base.entity.ts   # UUID PK + createdAt + updatedAt
│   │       ├── database/
│   │       │   ├── data-source.ts      # TypeORM CLI config (migrations ledger: "migrations_api")
│   │       │   ├── migrations/         # Domain DB migrations
│   │       │   └── seed.ts
│   │       ├── app.module.ts
│   │       └── main.ts
│   │
│   └── web/                            # Next.js 15 App Router Frontend
│       └── app/
│           ├── (auth)/                 # Login / Register pages
│           └── (dashboard)/            # Protected dashboard
│               ├── admin/              # Admin panels (doctors, appointments)
│               └── patient/            # Patient-facing pages (book, my-appointments)
│
├── docs/
│   └── docs/
│       ├── ERD.md                      # Entity Relationship Diagram (all tables)
│       ├── DATABASE_DESIGN.md          # Full schema reference with column types
│       ├── Architecture.md             # System architecture & module map
│       ├── FolderStructure.md          # This file
│       ├── RBAC.md                     # Role permissions matrix
│       ├── API_CONTRACT.md             # REST endpoint reference
│       ├── AUTHENTICATION.md           # Auth flow documentation
│       └── SetupGuide.md               # Local dev setup steps
│
└── package.json                        # Monorepo root scripts (dev, migration:run, seed)
```

---

## Why Each Module & Folder Exists

### `api-gateway` Rationale

- **Owns `users` + `hospital_admins`**: Auth (JWT, cookies, refresh tokens) and user identity are managed here. Keeping this separate from the domain API means the gateway can scale independently.
- **`hospital_admins` table**: Admin-specific data (hospital name, department) is an extension of `users`. It lives in the gateway because it's in the same DB schema boundary as `users`.

### `api` (Domain) Rationale

- **`modules/doctor/`**: Doctor profiles are the foundation of the scheduling system. Keeping them separate from `users` means a doctor's professional data (fees, specialization) can evolve without touching auth logic.
- **`modules/patient/`**: Patient health data (blood group, allergies, DOB) is clinical and belongs in the domain API. Separate from `users` so it can hold medical fields without polluting the auth table.
- **`shared/entities/base.entity.ts`**: All domain tables extend `BaseEntity` to get `id`, `createdAt`, `updatedAt` without repeating those columns in every entity class.
- **Separate `migrations_api` ledger**: Both apps share one database. Two separate ledger tables prevent `migration:revert` on the gateway from accidentally touching a domain migration it can't resolve.

### `web` (Frontend) Rationale

- **`app/(auth)/`**: Route group isolating login/register without adding those paths to the dashboard URL tree.
- **`app/(dashboard)/admin/`**: Admin-only pages (doctor management, appointments overview).
- **`app/(dashboard)/patient/`**: Patient-facing pages (book appointment, my appointments, profile).
- **`components/`**: Reusable UI pieces shared across pages.
- **`services/`**: All API calls go through typed service functions — UI components never call `fetch`/`axios` directly.
