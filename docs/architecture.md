# Architecture

This page explains how the app is put together, who owns what, and how to demo it.

## Request flow

```text
Browser → web :3000
            /api/*  (Next rewrite)
              ↓
         gateway :3001   cookie JWT, /auth/*
              ↓
         api :3002       domain modules (workouts, plans, goals, coach)
              ↓
         Postgres :5434
```

The browser only ever talks to the web app. The web app forwards API calls to the gateway, the gateway checks the login cookie and forwards the request to the domain API as a Bearer token, and the domain API talks to Postgres.

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
| `apps/api`         | Domain Nest API (`:3002`) — `@app/api`                                                |
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

This is a fitness tracker. Athletes log workouts, the app tracks their personal records automatically, and coaches get read-only visibility into athletes an admin has assigned to them.

All domain tables live in `apps/api` (migrations only, no auto-sync). The `userId` / `coachUserId` / `athleteUserId` columns are plain foreign keys pointing at the gateway's `users` table — the domain API does not keep its own copy of user accounts.

**Entities:**

```text
Workout (userId, title, performedAt, deletedAt — soft delete)
  └─ has many ─ ExerciseLog (exerciseName)
                  └─ has many ─ Set (reps, weightKg — optional, for bodyweight exercises)

PersonalRecord (one per userId + exerciseName, bestWeightKg optional, bestReps)

WorkoutPlan (userId, title, notes)
  └─ has many ─ PlanDay (dayLabel, order, exercises)

Goal (userId, exerciseName, targetWeightKg, targetReps?, targetDate?)
  — progress is calculated live from PersonalRecord, not stored

CoachAthlete (one row per coach + athlete pair) — controls what a coach can see under /coach/*
  — only an admin can create or remove these rows
```

**How personal records stay correct:**

- When a workout is saved, each set is checked against the athlete's current best for that exercise. It only updates the record if it's a genuine improvement (a tie doesn't count). If the exercise has no weight (like pull-ups), reps are compared instead of weight.
- Editing or deleting a workout can also make an old record _worse_ — for example, deleting the workout that held someone's best lift. A plain "did this beat the record" check can't handle that, so after an edit or a delete, the app recalculates that exercise's record from scratch by looking at every workout that's still active. This is what keeps `/prs` accurate even after you change your history.

**Who can see and do what:**

- Every read and write is scoped to the logged-in user — you can never see or edit someone else's workouts, plans, or goals (checked, returns 403/404 otherwise).
- Coaches can only read data for athletes an admin has explicitly assigned to them, and can never edit anything on an athlete's behalf.
- Admins have one job in this app: assigning athletes to coaches, at `/admin/coach-assignments`.
- The web app's `middleware.ts` hides pages a role shouldn't see, but the real security check always happens on the API side.

**Editing a workout:**

You can now edit a workout's title, date, and its full list of exercises/sets, not just title and date. Saving an edit replaces the whole exercise list for that workout and re-checks personal records for every exercise involved (old and new).

## Demo script

**Core features (5 min):**

1. Log in as `user@demo.local` / `password123`.
2. Visit `/workouts/new`, log a workout with 2+ exercises/sets (e.g. a set that beats a seeded PR) → PR toast shown for the beaten exercise.
3. Log a second workout with a bodyweight exercise (e.g. "Pull-ups", 12 reps, no weight) → saves fine; `/prs` shows it as "12 reps", not "0 kg".
4. Visit `/workouts` → both workouts appear; try the date/exercise filters; edit a workout (change a set) and see `/prs` update; delete a workout and confirm any record that came only from it drops to the next-best set (or disappears).
5. Visit `/prs` → best weight reflects your latest workouts.
6. Log out, visit `/workouts/new` directly → redirected to log in, then sent back to `/workouts/new` after logging in.
7. Log in as `staff@demo.local` and visit `/workouts` → blocked (that page is for athletes only).

**Extra features (5 min):**

8. As `user@demo.local`, visit `/plans` → create a plan with 2 days and some exercises; edit it; delete it.
9. Visit `/goals` → create a goal for an exercise you already have a record in; the progress bar reflects it.
10. Visit `/dashboard` → recent workouts, top exercises, and goal progress, all real data.
11. Log in as `staff@demo.local`, visit `/coach` → only shows athletes assigned to this coach; open one to see their read-only history and records.
12. As `staff@demo.local`, try to view an athlete who isn't assigned to you → blocked.
13. Log in as `admin@demo.local`, go to `/admin/coach-assignments` → assign an athlete to a coach, see it appear in the list, then remove it.
