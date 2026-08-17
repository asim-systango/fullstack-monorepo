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

**Fitness tracker** — full spec at [specs/SPEC.md](../specs/SPEC.md). All domain tables live in `apps/api` (`synchronize: false`, migrations only); `userId`/`coachUserId`/`athleteUserId` columns are plain FKs into the gateway's `users` table (no local users table).

**ERD (Must tier):**

```text
Workout (userId, title, performedAt, deletedAt soft-delete)
  └─OneToMany(cascade)─ ExerciseLog (exerciseName)
                          └─OneToMany(cascade)─ Set (reps, weightKg nullable — bodyweight sets)

PersonalRecord (UNIQUE(userId, exerciseName), bestWeightKg nullable, bestReps)
```

**ERD (Should tier):**

```text
WorkoutPlan (userId, title, notes)
  └─OneToMany(cascade)─ PlanDay (dayLabel, order, exercises: jsonb[])

Goal (userId, exerciseName, targetWeightKg, targetReps?, targetDate?)
  — progress computed at read time against the matching PersonalRecord, not stored

CoachAthlete (UNIQUE(coachUserId, athleteUserId)) — join table gating /coach/* reads
  — managed by `admin` only, via /coach/assignments* (see Admin below)
```

**Key invariants:**

- `PersonalRecord.upsertIfBeaten` runs inside the same DB transaction as the workout save (`WorkoutsService.create`); a set only writes when it **strictly beats** (not ties) the stored best. When a set has no `weightKg` (bodyweight exercise — e.g. pull-ups), the comparison basis switches to `reps` instead of weight, and the PR row's `bestWeightKg` is cleared to `null` on that write.
- `PersonalRecord.recomputeForExercise` (distinct from `upsertIfBeaten`) recalculates a PR **from scratch** across every non-deleted workout for that exercise. This is required — not optional — after two operations `upsertIfBeaten` cannot handle correctly, since it can only raise a PR, never lower or remove one:
  - **Editing** a workout's exercises/sets (`PATCH /workouts/:id` with an `exercises` body) — replaces the entire exercise/set tree in one transaction, then recomputes every exercise name affected (union of old + new names).
  - **Soft-deleting** a workout — recomputes every exercise name that workout contained, so a deleted workout's set can no longer be the recorded PR.
- Every workout/plan/goal read and write is scoped to `entity.userId === currentUser.id`; cross-user access is 403/404 (verified for workouts, plans, and goals).
- Coaches (`staff`) only ever get `GET` routes under `/coach/*`, gated by a `CoachAthlete` row for that (coach, athlete) pair — no controller in the app exposes a mutation path for `staff` on athlete data. `/plans`, `/goals`, `/workouts`, `/prs`, `/dashboard` are `@Roles('user')`-only on both the domain API and the web middleware.
- Goal progress (`progressPercent`) is `min(100, round(currentBestWeightKg / targetWeightKg * 100))`, computed on every read from `PersonalRecordsService.findOneForUser` — 0% when no PR exists yet for that exercise.
- Web middleware (`apps/web/middleware.ts`) mirrors the API's role split for UI gating only; the domain API's `@Roles` guards are the real authorization boundary.

**Workout edit (full, including exercises/sets):**

- `GET /workouts/:id` returns one owned workout with `exerciseLogs.sets` — added specifically to prefill the edit form.
- `PATCH /workouts/:id` still accepts a title/date-only partial update (unchanged), but now also accepts an optional `exercises` array (same shape/validation as `POST /workouts`). When present, `WorkoutsService` deletes the existing `ExerciseLog`s (DB cascade drops their `Set`s) and inserts the new tree in one transaction, then runs `recomputeForExercise` per the invariant above.
- Web: `apps/web/app/(app)/workouts/[id]/edit/page.tsx` fetches the workout, loads it into the same Redux draft the create flow uses (`loadLoggerDraft`), and renders the same `WorkoutForm` in `mode="edit"`. `workout-draft-utils.ts` holds the validation/conversion logic shared by both create and edit.

**Admin: coach↔athlete assignment:**

- New role usage: `admin` previously had no screens. It now owns assigning athletes to coaches — a prerequisite for the `/coach/*` read-only visibility to mean anything.
- `CoachController` reuses the existing `/coach` path with **method-level** `@Roles('admin')` overriding the controller's class-level `@Roles('staff')` (Nest's `getAllAndOverride` resolves method over class): `GET/POST /coach/assignments`, `GET /coach/assignments/coaches`, `GET /coach/assignments/athletes`, `DELETE /coach/assignments/:id`. Candidate/coach lookups query the gateway's `users` table by role via the same raw-SQL cross-DB pattern the existing coach endpoints already used (shared `DATABASE_URL`, no live TypeORM relation — see Boundaries).
- Assigning validates `coachUserId` is role `staff` and `athleteUserId` is role `user` (400 otherwise) and rejects duplicate pairs (409, backed by the `UNIQUE(coachUserId, athleteUserId)` constraint).
- Web: `/admin/coach-assignments` — gated by `middleware.ts`'s `ADMIN_ONLY_PREFIXES`, landing page for `admin` via `getHomeHref`. "Assign athlete" opens a dialog (coach/athlete selects); the page also lists and can remove existing assignments.

## Demo script

**Must tier (5 min):**

1. Log in as `user@demo.local` / `password123`.
2. Visit `/workouts/new`, log a workout with 2+ exercises/sets (e.g. a set that beats a seeded PR) → redirected/confirmed, PR toast shown for the beaten exercise.
3. Log a second workout with a bodyweight exercise (e.g. "Pull-ups", 12 reps, leave weight blank) → saves without a weight-required error; `/prs` shows it as reps-based (e.g. "12 reps"), not "0 kg".
4. Visit `/workouts` → both workouts appear; apply a date/exercise filter; edit a workout via the pencil icon (change reps/weight on a set) and confirm the PR table updates accordingly; delete a workout via the confirm dialog and confirm any PR that came only from that workout drops to the next-best remaining set (or disappears if none remain).
5. Visit `/prs` → updated best weight reflected.
6. Log out, visit `/workouts/new` directly → redirected to `/login?next=/workouts/new`; log back in → lands back on `/workouts/new`.
7. Log in as `staff@demo.local` and visit `/workouts` → access-denied (role gate).

**Should tier (5 min):**

8. As `user@demo.local`, visit `/plans` → create a plan with 2 days, each with 1+ exercises (sets/reps targets); edit it (replaces all days); delete it.
9. Visit `/goals` → create a goal for an exercise you already have a PR in; progress bar reflects `currentBestWeightKg / targetWeightKg`.
10. Visit `/dashboard` → recent workouts, top exercises, active goal progress, all sourced from live data (no mock).
11. Log in as `staff@demo.local`, visit `/coach` → roster shows only athletes seeded into `coach_athletes` (currently `user@demo.local`); drill into the athlete → read-only workout history + PR table, no edit/delete controls anywhere.
12. As `staff@demo.local`, attempt to hit an unassigned athlete's `/coach/athletes/:id/workouts` → 403.
13. Log in as `admin@demo.local`, land on `/admin/coach-assignments` → click "Assign athlete", pick a coach + athlete, submit → new row appears in the assignments table; remove it via the trash icon + confirm dialog. Attempting any `/coach/assignments*` call as `user` or `staff` → 403 (method-level `@Roles('admin')`).

**Stretch tier:** not built — out of scope for this run (see [specs/SPEC.md](../specs/SPEC.md) Open Questions).
