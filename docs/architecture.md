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

### ERD & Entities

- **Hotel**: Main listing entity. Stores metadata like name, city, address, description, and image URL. Supports soft delete using TypeORM `deletedAt` column.
- **Room**: Belongs to a Hotel. Has `type` (`single`, `double`, `suite`), `pricePerNight` (stored in integer cents), `capacity`, and `amenities`.
- **Booking**: Connects `roomId` and `userId` for specific `checkIn` and `checkOut` dates. Tracks reservation state (`pending`, `confirmed`, `completed`, `cancelled`) and `totalPrice`.
- **PaymentIntent**: Created atomically within a transaction during booking. Tracks billing status (`pending`, `paid`, `failed`, `refunded`).
- **Review**: Guest-submitted feedback. Stores `rating` (1-5) and `comment`.

### Key Invariants

1. **No Overlapping Bookings**: The `BookingsService` verifies that no other active (non-cancelled) reservation exists for the same `roomId` that overlaps with the selected `checkIn` and `checkOut` range.
2. **Atomic Transactional Booking & Payment**: The booking creation and corresponding `PaymentIntent` are saved within a database transaction, guaranteeing atomic payment registration.
3. **Completed-Stay Review Enforcement**: The `ReviewsService` ensures a user can only leave a review for a hotel if they have a historical reservation with status `completed`.

---

## Demo Script

### 1. Multi-Role Authentication Flow (~1 min)

- Open the application at `http://localhost:3006`.
- Navigate to `/login` and log in with three roles to check RBAC:
  - **User (Guest)**: `user@demo.local` / `password123`
  - **Staff (Hotel Manager)**: `staff@demo.local` / `password123`
  - **Admin**: `admin@demo.local` / `password123`

### 2. Core Booking Happy Path (~2 min)

- Log in as `user@demo.local`.
- Search hotels in the catalog page, select **Coastal Breeze Resort**.
- Enter check-in and check-out dates, click **Check Availability**.
- Click **Book Now** on the available "Ocean View Single" room.
- In the premium payment modal, review the total calculated price and click **Confirm & Pay**.
- The page automatically redirects to **My Bookings**, showing the booking as `Confirmed` and payment as `Paid`.

### 3. Invariant Overlap Failure Walkthrough (~1 min)

- Log in as `user@demo.local`.
- Go to the same room at **Coastal Breeze Resort**.
- Attempt to select dates that conflict with the newly made booking (e.g. overlapping check-in/out).
- Try to confirm booking; expect a clean overlap alert rejecting the transaction.

### 4. Admin/Staff Hotel & Booking Management (~1 min)

- Log in as `staff@demo.local` or `admin@demo.local`.
- Navigate to `/manager` or click **Add Room** on the hotel detail page to perform CRUD management actions.
- Manage room listing status, and review the revenue summary/occupancy metrics.
- **Soft Delete**: As an administrator, delete a hotel from the public view, verifying it no longer appears in search but remains in the database.
