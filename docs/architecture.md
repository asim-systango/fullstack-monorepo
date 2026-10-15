# Architecture

Fill in **Domain notes** and **Demo script** for your project before the PR.

## Request flow

```text
Browser → web :3000
            /api/*  (Next rewrite)
              ↓
         gateway :3001   cookie JWT, /auth/*
              ↓
         api :3002       your domain modules
              ↓
         Postgres :5434
```

## Who owns what

| Layer          | Owns                        | Does not own       |
| -------------- | --------------------------- | ------------------ |
| Next UI        | Pages, layout, forms        | Product CRUD APIs  |
| TanStack Query | Server lists and mutations  | Form drafts        |
| Redux Toolkit  | Drafts, filters, selection  | Nest entity arrays |
| API gateway    | Login cookies, CORS, proxy  | Domain tables      |
| Domain API     | Entities, rules, migrations | Browser cookies    |
| Postgres       | Data + constraints          | —                  |

## Folders

| Path               | Role                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| `apps/web`         | Next UI (`:3000`) — `@app/web`                                                        |
| `apps/api-gateway` | Auth + BFF (`:3001`) — `@app/api-gateway`                                             |
| `apps/api`         | Domain Nest API (`:3002`) — `@app/api` (**your Must work**)                           |
| `libs/ui`          | Shared UI kit + theme — prefer `@shared/ui/components` ([frontend.md](./frontend.md)) |
| `libs/*`           | Other shared packages (`@shared/*`) — folder subpaths when folders exist              |
| `docker/`          | Compose: Postgres only · deploy stubs: `Dockerfile.{gateway,api,web}`                 |
| `docs/projects/`   | Capstone briefs                                                                       |

Optional Stretch microservice: [adding-a-service.md](./adding-a-service.md).

## Conventions

- Responses: `{ data: T }` — `@shared/http` envelope (`@shared/http/filters`, `@shared/http/interceptors`) + `@shared/api-client`
- Errors: `{ statusCode, error, message, details? }` via shared `AllExceptionsFilter`
- Browser auth: httpOnly cookie from the gateway (`@Public()` for anonymous routes)
- Domain API auth: Bearer JWT (gateway forwards the cookie as `Authorization`)
- Shared auth: `@shared/http/auth` (`JwtAuthGuard`, `RolesGuard`, `@Public` / `@Roles`) — apps re-export via `common/auth`
- Cookie→Bearer hop: `apps/api-gateway/src/common/proxy-hop.ts` (unit-tested)
- OpenAPI: `/docs` on gateway (cookie) and domain API (Bearer) via `@shared/http/swagger` — local/dev only
- UI: `@shared/ui/components` + `@shared/ui/theme.css` — [frontend.md](./frontend.md); gallery at `/ui`
- Imports: prefer folder subpaths (`@shared/pkg/folder`); Nest apps use folder `index.ts` barrels (`./config`, `./common/auth`, `./modules/auth`); flat packages stay on the package root until a folder exists
- Entities: `*.entity.ts` under `apps/api/src/modules/`
- Users migration/seed: gateway · domain migrations: `apps/api`
- Smoke: `pnpm doctor` (per-hop) or `http://localhost:3000/api/ready`
- Scripts: see root [README](../README.md) (`pnpm dev`, `pnpm doctor`, `pnpm dev:api`, …)

## Domain notes

### Entity Relationship & Schema Architecture

The Hospital Appointment System architecture centers around a normalized PostgreSQL relational schema designed for transactional integrity, medical audit compliance, and strict role scoping:

- **`users`**: Identity table storing credentials, authentication metadata, and system role (`ADMIN`, `DOCTOR`, `PATIENT`).
- **`doctor_profiles`**: Linked 1:1 to `users` (where role = `DOCTOR`). Contains practitioner credentials (`specialization`, `qualification`, `experienceYears`, `consultationFee`, `biography`, `profileImage`, `isActive`, `deletedAt`).
- **`slots`**: Time slot availability management (foreign key `doctorId`). Tracks consultation start/end timestamps and lifecycle status (`AVAILABLE`, `BOOKED`, `BLOCKED`).
- **`appointments`**: Central booking records linking `patientId` (User) and `slotId` (Slot). Tracks status (`SCHEDULED`, `COMPLETED`, `CANCELLED`), booking reason, and `deletedAt` for soft-deletion audit compliance.
- **`prescriptions`**: 1:1 relation to `appointments`. Stores structured medication lists (`medicines` JSON array) and clinical usage instructions.
- **`medical_notes`**: Clinical documentation linked 1:1 to `appointments` (foreign key `doctorId`). Scoped to clinicians and hidden from patient self-service views.
- **`insurance_claims`**: 1:1 relation to `appointments`. Stores claim submission metadata (`providerName`, `policyNumber`, `claimAmount`, `coveredAmount`, `copayAmount`, `status`).
- **`notifications`**: User-scoped dispatch records (`userId`, `title`, `message`, `type`, `isRead`, `createdAt`) powering the header popover drawer.

### Architectural Invariants & Security Guarantees

1. **Pessimistic Write Locking (`pessimistic_write`)**:
   - High-concurrency slot booking uses `SELECT ... FOR UPDATE` on `slots` inside NestJS TypeORM transactions.
   - Guarantees zero double-booking under parallel booking requests.
2. **Transactional Slot Release & Soft Deletes**:
   - Appointment cancellations and doctor deactivations execute within database transactions.
   - Cancelling an appointment automatically frees the slot (`AVAILABLE`). Deactivating a doctor soft-deletes the profile while safely unpublishing future open slots without corrupting historical medical visits.
3. **Strict Role-Based Access Control (RBAC)**:
   - Backend routes are guarded by `@Roles()` and `@CurrentUser()` decorators.
   - `PATIENT` role sees only self-owned appointments; `DOCTOR` role accesses only appointments assigned to their slots; `ADMIN` role retains hospital-wide search and governance capabilities.
4. **Healthcare Interoperability (FHIR R4 / HL7 v2)**:
   - Export endpoints (`GET /appointments/:id/fhir` and `/hl7`) convert internal database records into standardized FHIR R4 JSON Bundles (`Patient`, `Encounter`, `Condition`, `MedicationRequest`) and HL7 v2 ORU^R01 observation strings.

---

## Demo Script (5-Minute Evaluation Guide)

### ⏱️ Minute 0:00 – 1:00 | Authentication & Role-Based Portals

1. **Launch App**: Open `http://localhost:3000`. Observe responsive UI with standard theme tokens.
2. **Patient Persona**: Login as Patient (`patient@hospital.com` / `Password123!`). View the Patient Dashboard showing upcoming appointments and quick action widgets.
3. **Header Controls**: Observe the **Notification Bell** icon in the header showing unread booking and reminder notifications.

### ⏱️ Minute 1:00 – 2:00 | Doctor Profile & Custom Schedule Creation

1. **Switch to Doctor Persona**: Logout and login as Doctor (`doctor@hospital.com` / `Password123!`).
2. **Schedule Management**: Navigate to `/doctor/schedule`. Create a new consultation slot (or shift) specifying date, start time, and duration.
3. **Admin Onboarding**: Login as Admin (`admin@hospital.com` / `Password123!`). Navigate to `/admin/doctors`. Click "Onboard Doctor" to demonstrate practitioner creation and modal status toggle.

### ⏱️ Minute 2:00 – 3:00 | Patient Consultation Booking & Stripe Checkout

1. **Browse Doctors**: Login as Patient and navigate to `/doctors`. Select a doctor profile to view details and open consultation slots.
2. **Slot Reservation**: Click on an open slot. Select consultation reason and click "Proceed to Payment".
3. **Payment Flow**: Modal integrates Stripe Checkout redirection. Upon successful payment verification, the appointment transitions to `SCHEDULED` status with locked slot.

### ⏱️ Minute 3:00 – 4:00 | Clinical Consultation Completion & Medical Records

1. **Doctor Visit Workflow**: Login as Doctor and navigate to `/appointments`. Select the scheduled appointment.
2. **Issue Prescription & Note**: Click "Complete Visit". Fill in clinical notes and add prescribed medicines with dosages.
3. **Save Record**: Submit the form. Notice status changes to `COMPLETED` and prescription badges appear.

### ⏱️ Minute 4:00 – 5:00 | Interoperability, Notifications & Insurance Claims

1. **FHIR R4 / HL7 Record Export**: On the completed appointment card, click **"Export Record"**. Select **FHIR R4 JSON** or **HL7 v2 Text** preview tab and click **Download File**.
2. **Insurance Claim Submission**: Click **"Submit Insurance Claim"** on the appointment card. Enter provider details and claim amount.
3. **Admin Claim Approval**: Switch to Admin persona (`/admin/insurance`). Review the submitted claim, calculate co-pay, and click **"Approve Claim"**.
4. **Final System Verification**: Check total unit test coverage and clean type-check across all monorepo workspaces (`pnpm typecheck` & `pnpm test`).
