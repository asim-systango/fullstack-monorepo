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

### ERD & Entities (`apps/api/src/modules/`)
- `Event`: `id`, `title`, `description`, `location`, `startDate`, `endDate`, `capacity`, `organizerId`, `status` (`DRAFT`, `PUBLISHED`, `CANCELLED`), `category`, `deletedAt` (Soft Delete).
- `Rsvp`: `id`, `eventId`, `userId`, `status` (`YES`, `NO`, `MAYBE`), unique constraint on `(eventId, userId)`.
- `Ticket`: `id`, `rsvpId`, `eventId`, `userId`, `qrPayload` (unique token hash), `status` (`ISSUED`, `USED`, `CANCELLED`).
- `WaitlistEntry`: `id`, `eventId`, `userId`, `position`, `status` (`WAITING`, `PROMOTED`, `CANCELLED`).
- `CheckIn`: `id`, `ticketId`, `scannedByUserId`, `scannedAt`.

### Key Hard Invariant & Transaction
- **Capacity Enforcement**: Capacity is strictly checked inside a database row-lock transaction (`pessimistic_write`). When capacity is reached (`yesCount >= capacity`), new `YES` RSVPs are added to `WaitlistEntry` with status `WAITING` and position calculated.
- **Cancellation Promotion Transaction**: When a user cancels a `YES` RSVP, a single TypeORM transaction:
  1. Updates the user's RSVP to `NO`/cancelled and marks their ticket as `CANCELLED`.
  2. Queries the oldest `WAITING` waitlist entry (`ORDER BY position ASC, createdAt ASC`).
  3. Promotes the waitlist entry to `PROMOTED`.
  4. Automatically creates a `YES` RSVP and issues a new `Ticket` with a unique `qrPayload` for the promoted waitlist user.

## Demo script

1. **Role Login & Navigation**:
   - Log in as `admin@demo.local` (Admin) or `staff@demo.local` (Staff / Organizer) with password `password123`.
   - Access `/organizer` (Organizer Dashboard) to view event metrics (Total Events, Confirmed Attendees, Waitlist Queue, Occupancy Rate).
2. **Event Creation & Catalog Filtering**:
   - Go to `/events/new` and publish a new event with capacity `2`.
   - Go to `/events` and use the search bar, category tabs, and Grid/Table view toggles to filter events (backed by Redux Toolkit).
3. **Capacity Limit & Automatic Waitlisting**:
   - Log in as `user@demo.local` (Attendee) and navigate to the event with capacity `2`.
   - RSVP `YES` -> Capacity is full (2/2) -> System automatically adds user to the **Waitlist** at Position #1.
4. **Cancellation & Transactional Waitlist Promotion**:
   - Log in as `staff@demo.local` (one of the registered attendees) and cancel the RSVP (`YES` -> `NO`).
   - The transaction runs: `staff@demo.local` ticket is cancelled, and `user@demo.local` is automatically promoted from the waitlist and issued a ticket pass!
5. **Staff QR Check-In Scanner & Soft-Delete**:
   - As `staff@demo.local`, navigate to `/check-in` (Staff Ticket Check-In Tool).
   - Enter/scan the promoted ticket's `qrPayload` -> Ticket is verified and marked `USED` with timestamp recorded. Scanning again shows "Ticket already used".
   - Delete an event on `/organizer` -> Event is soft-deleted (`deletedAt` set in database).
