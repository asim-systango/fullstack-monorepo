# Hotel Booking Platform — AI Assistant Rules

> These rules MUST be followed by any AI assistant (Gemini, Antigravity, etc.) working on the `hotel-booking` project in this monorepo.

## Project Context

- **Slug:** `hotel-booking`
- **Branch:** `<dev-name>/hotel-booking`
- **Roles:** `admin`, `staff` (hotel_manager), `user` (guest)
- **Entities:** Hotel, Room, Booking, Review, PaymentIntent

## Architecture Rules (MANDATORY)

1. **Domain code goes ONLY in `apps/api/src/modules/`** — never in Next.js (`apps/web`), never in the gateway (`apps/api-gateway`).
2. **Auth stays on `apps/api-gateway`** — do NOT recreate users/auth tables in `apps/api`. Store `userId` as a UUID foreign key string. Never import the gateway's `User` entity in the domain API.
3. **Browser → `/api` on `:3000`** — Next.js rewrites `/api/*` to the gateway at `:3001`, which proxies to the domain API at `:3002`. Never call `:3002` directly from the frontend.
4. **Cookie JWT** — httpOnly `access_token` cookie set by the gateway. Never use `localStorage` for auth tokens.
5. **`synchronize: false` always** — all schema changes via TypeORM migrations (`pnpm migration:generate`, `pnpm migration:run:api`). Never set `synchronize: true`.
6. **Response envelope** — success: `{ data: T }` via `@shared/http/interceptors/ResponseEnvelopeInterceptor`. Errors: `{ statusCode, error, message, details? }` via `@shared/http/filters/AllExceptionsFilter`.
7. **ValidationPipe** — `whitelist: true`, `forbidNonWhitelisted: true` on domain API. Every DTO must use `class-validator` decorators.

## Frontend Rules

8. **TanStack Query** for ALL server data — lists, details, mutations (`useQuery`, `useMutation`). Never put Nest entity arrays in Redux.
9. **Redux Toolkit** — ONLY for unfinished drafts, filter state, and UI selections.
10. **Use `@shared/ui/components`** — `Button`, `Form`, `Field`, `TextInput`, `Select`, `Table`, `Card`, `CardBody`, `CardHeader`, `CardTitle`, `Page`, `PageHeader`, `LoadingState`, `EmptyState`, `Alert`, `Badge`, `Dialog`, `Skeleton`, `Spinner`, `Separator`, `TextArea`, `Checkbox`. No one-off HTML for these patterns.
11. **Semantic theme tokens** — use `bg-background`, `text-primary`, `bg-primary`, `text-muted-foreground`, etc. Never invent hex colors in page files.
12. **Three UI states** — every data-fetching component MUST handle: Loading → Empty → Content (and Error). Use `LoadingState`/`Skeleton` for loading, `EmptyState` for no data, `Alert`/`StatusMessage` for errors.
13. **Import conventions:**
    - UI: `import { Button, ... } from '@shared/ui/components'`
    - API client: `import { ... } from '@shared/api-client'`
    - HTTP helpers: `from '@shared/http/filters'`, `from '@shared/http/interceptors'`
    - Auth: `from './common/auth'` (which re-exports `from '@shared/http/auth'`)
    - Local components: `from '@/components/...'`
    - Local lib: `from '@/lib/...'`

## Module Structure Convention

Each domain module folder under `apps/api/src/modules/<name>/` must contain:

```
<name>/
  dto/
    create-<name>.dto.ts
    update-<name>.dto.ts
    <name>-query.dto.ts      (for list filters)
  <name>.entity.ts
  <name>.controller.ts        (or <plural>.controller.ts)
  <name>.service.ts            (or <plural>.service.ts)
  <name>.module.ts             (or <plural>.module.ts)
  index.ts                     (barrel export)
```

Register each module in `apps/api/src/app.module.ts` imports array.

## Entity Conventions

- File naming: `*.entity.ts`
- Use `@PrimaryGeneratedColumn('uuid')`
- Use `@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })` and `@UpdateDateColumn`
- Soft-deletable entities: use `@DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })`
- Column names: snake_case in DB, camelCase in TypeScript (use `@Column({ name: 'snake_case' })`)
- Foreign keys: store as UUID strings with `@Column({ name: 'user_id', type: 'uuid' })` — NOT as relations to gateway entities

## Key Domain Rules

### Hard Invariant: No Overlapping Bookings

- Before inserting a booking, check for any existing `confirmed` booking on the same `roomId` where the date ranges overlap.
- Overlap condition: `existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn`
- Return `409 Conflict` if overlap exists.

### Required Transaction

- Creating a booking MUST atomically: (1) verify availability, (2) insert Booking, (3) insert PaymentIntent with status `paid`.
- Use `DataSource.transaction()` or `QueryRunner`.

### Soft-Delete

- `Hotel` is the primary listable resource — must have `@DeleteDateColumn`.
- `DELETE /hotels/:id` performs soft-delete, not hard delete.
- Public lists exclude soft-deleted records. Admin can query with `?withDeleted=true`.

### Pagination

- Use `page` + `limit` query params (default: page=1, limit=10).
- Return: `{ data: T[], meta: { total, page, limit, totalPages } }`.

### Filters on Hotel List

- `?city=<string>` — filter by city (case-insensitive)
- `?q=<string>` — search by name/description (ILIKE)
- Both filters combinable.

## API Endpoints Reference

```
GET    /hotels                         @Public   paginated, ?city=&q=&page=&limit=
GET    /hotels/:id                     @Public   detail with rooms
POST   /hotels                         @Roles('admin','staff')
PATCH  /hotels/:id                     @Roles('admin','staff')
DELETE /hotels/:id                     @Roles('admin','staff')  soft-delete

GET    /hotels/:hotelId/rooms          @Public
POST   /hotels/:hotelId/rooms          @Roles('admin','staff')
PATCH  /rooms/:id                      @Roles('admin','staff')
DELETE /rooms/:id                      @Roles('admin','staff')

GET    /availability                   @Public   ?hotelId=&checkIn=&checkOut=

GET    /bookings                       Auth required (own bookings; admin sees all)
POST   /bookings                       Auth required — TRANSACTION
PATCH  /bookings/:id/cancel            Auth required (owner or admin)
GET    /bookings/:id                   Auth required

GET    /hotels/:hotelId/reviews        @Public
POST   /reviews                        Auth required

GET    /bookings/:id/payment           Auth required
```

## Frontend Pages

```
/                          Home — featured hotels, search CTA
/hotels                    Hotel list with filters
/hotels/[id]               Hotel detail + rooms + availability + reviews
/bookings                  User's bookings (auth required)
/manager                   Manager dashboard (staff/admin only)
/login                     Existing
/register                  Existing
```

## Seed Data Requirements

- Gateway users: `pnpm seed` (admin, user, staff already exist)
- Domain seed: custom script with ≥8 realistic rows across all entities
- Hotels: ≥3, with real-sounding names and cities
- Rooms: ≥2 per hotel
- Bookings: mix of confirmed, completed, cancelled
- Reviews: on completed bookings
- PaymentIntents: one per booking

## Pre-PR Checklist

1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. `pnpm test` passes
4. `pnpm docker:db` → `pnpm migration:run` → `pnpm seed` → `pnpm migration:run:api` → domain seed
5. `pnpm doctor` (recommended)
6. `docs/architecture.md` filled with domain notes + demo script
7. Demo script in PR body (≤5 minutes)
8. Commit `pnpm-lock.yaml` if deps changed
