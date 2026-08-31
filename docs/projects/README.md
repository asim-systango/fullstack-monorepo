# Project briefs

One shared codebase: domain in `apps/api`, UI in `apps/web`, auth on `apps/api-gateway`.

Do **not** recreate users/auth in the domain API — store `userId` FKs and reuse gateway roles. Env: root + `apps/api-gateway/.env` + `apps/api/.env` + `apps/web/.env.local`.

Build UI with **`@shared/ui/components`** and **`@shared/ui/theme.css`**. Gallery: `/ui`. Guide: [frontend.md](../frontend.md).

Read your brief **fully** before coding. You are graded against that brief’s Must / Should / Stretch plus [grading.md](../grading.md), [stack.md](../stack.md), and [submission.md](../submission.md).

---

## How the starter repo works

You are **not** building from scratch. The monorepo already provides:

| Layer              | What exists today                                   | What you build                                                             |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/api-gateway` | Register, login, logout, cookie JWT, user seed      | Nothing (reuse as-is)                                                      |
| `apps/api`         | Health check, JWT validation                        | **All domain modules** — entities, services, controllers, migrations, seed |
| `apps/web`         | Login, register, home stub, UI gallery              | **All domain pages** — lists, forms, dashboards, role-aware nav            |
| `libs/*`           | Shared UI kit, auth guards, API client, env loaders | Reuse; do not fork                                                         |

### Request flow (every project)

```text
Browser (:3000)
  → Next.js pages + TanStack Query
  → /api/* rewritten to gateway (:3001)
       → /auth/* handled here (cookie JWT set/cleared)
       → other /api/* proxied to domain API (:3002)
            → Bearer JWT (gateway converts cookie → Authorization header)
            → your Nest modules + Postgres (:5434)
```

**Key rule:** Users live in the **gateway** database. Your domain tables store `userId` (UUID FK) only. Never duplicate email/password/role columns in `apps/api`.

### Gateway roles (map to your domain)

The gateway stores three roles: `admin`, `staff`, and `user`. After `pnpm seed`, three demo users exist locally — **one account per role**. Map each gateway role to the domain personas in your brief (for example, `staff` → company, doctor, or seller).

| Gateway role | You map it to (examples)                                     |
| ------------ | ------------------------------------------------------------ |
| `admin`      | Platform admin                                               |
| `staff`      | Elevated domain role — company, doctor, seller, librarian, … |
| `user`       | End-user role — candidate, patient, buyer, member, …         |

Registration always creates role `user`. For demos, log in with a different role account for each persona. Enforce permissions with `@Roles('admin')`, `@Roles('staff')`, `@Roles('user')` from `@shared/http/auth`, plus ownership checks in services.

---

## What every project must deliver

These apply **in addition** to the Must checklist in your specific brief. See [grading.md](../grading.md) for the official rubric.

| Area              | Expectation                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Auth**          | Register / login / logout work; cookie JWT; **≥2 roles used meaningfully** (different screens or API rules per role) |
| **Domain model**  | ≥2 related entities with TypeORM migrations (`pnpm migration:run:api`) and seed (≥8 realistic rows)                  |
| **List endpoint** | Pagination + ≥2 filters + soft-delete on the main list resource                                                      |
| **Business rule** | One hard invariant enforced in a service (+ DB constraint when possible) — your brief names it                       |
| **Transaction**   | One multi-entity write in a DB transaction — your brief names it                                                     |
| **Frontend**      | Layout + list + create/detail pages; empty ≠ loading ≠ error; `@shared/ui/components`                                |
| **Data fetching** | TanStack Query for server data; Redux Toolkit for drafts/filters only                                                |
| **Docs**          | Fill `docs/architecture.md` (ERD notes + demo script)                                                                |
| **Demo**          | ≤5 minute walkthrough in the PR body                                                                                 |

### What “meaningful roles” means

Roles must change **behaviour**, not just display a label in the header.

| Good                                                 | Not enough                                     |
| ---------------------------------------------------- | ---------------------------------------------- |
| Candidate can apply; company can review applications | All roles see the same pages                   |
| Doctor manages slots; patient can only book for self | Role shown in profile but no `@Roles()` guards |
| Admin can suspend a company                          | Admin has identical CRUD to everyone           |

Implement role checks in **both** places when relevant: Nest `@Roles()` on controllers **and** UI hiding/disabling actions the user cannot perform.

### Suggested 6-day plan

| Day | Focus                                                       |
| --- | ----------------------------------------------------------- |
| 1   | Read brief; sketch ERD; create entities + migrations + seed |
| 2   | Core CRUD + invariant + transaction in `apps/api`           |
| 3   | List/detail/create pages with TanStack Query                |
| 4   | Role-based UI + RTK filters/drafts                          |
| 5   | Should-tier features + polish                               |
| 6   | Demo script, fill `docs/architecture.md`, PR checklist      |

Full stack rules: [stack.md](../stack.md).

---

## Frontend expectations (all projects)

How the UI should look and behave. Full component guide: [frontend.md](../frontend.md). Gallery: `/ui`.

### App shell

| Element             | Expectation                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Layout**          | Authenticated pages use a consistent shell (header with app title, nav, user name, role badge, logout) |
| **Navigation**      | Links shown **by role** — hide routes the user cannot access; do not rely on API 403 alone             |
| **Page wrapper**    | Domain pages use `Page` + `PageHeader` from `@shared/ui/components`                                    |
| **Unauthenticated** | `/login` and `/register` reuse existing auth pages; redirect to login when session missing             |

### Required page patterns

| Pattern                | When to use                                       | What it must include                                                                                |
| ---------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **List**               | Main browse resource (jobs, products, tickets, …) | Table or card grid; pagination controls; filter bar; clear empty/loading/error states               |
| **Detail**             | Single resource view                              | Key fields readable; role-gated action buttons (edit, delete, transition status)                    |
| **Create / Edit**      | Mutations                                         | `Form` + `Field` + labeled inputs; submit disabled while pending; show API validation errors inline |
| **Dashboard** (Should) | Role home / summary                               | Counts, recent items, or quick links — at least one role-specific dashboard for distinction         |

### UI states (mandatory — graded)

| State       | Component / pattern                                       | Never do this                                         |
| ----------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **Loading** | `LoadingState` or `Skeleton`                              | Blank white page while Query fetches                  |
| **Empty**   | `EmptyState` + primary action ("No jobs yet — post one")  | Empty table with no message                           |
| **Error**   | `Alert` / toast with API `message`; retry button on lists | Silent failure or generic "Something went wrong" only |
| **Success** | Toast or redirect after mutation; invalidate Query cache  | Stale list after create/update                        |

### Visual and UX standards

- **Components:** `@shared/ui/components` for buttons, forms, tables, cards, badges, dialogs — not raw unstyled HTML for domain UI
- **Colors:** Semantic tokens only (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`) — no one-off hex in pages
- **Buttons:** Primary actions = default `Button`; destructive = variant if available; links = accent/text style
- **Forms:** Every field has a visible label; required fields marked; show field-level errors from `details` array when API returns validation errors
- **Lists:** Display active filters; soft-deleted items **hidden** from default list (admin may have separate view)
- **Tables:** Column headers; row actions aligned right; status shown as `Badge` where applicable
- **Responsive:** Readable on laptop width (1280px); mobile polish is nice but not the primary bar

### Data fetching (web)

| Tool               | Use for                                                               | Do not use for                            |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------------- |
| **TanStack Query** | GET lists, GET detail, all mutations, cache invalidation after writes | Storing paginated entity arrays long-term |
| **Redux Toolkit**  | Filter values, sort, draft text not yet submitted, selected row IDs   | Full copy of server entity lists          |
| **API client**     | `@shared/api-client` or axios to `/api` with `withCredentials: true`  | Calling `:3002` directly from the browser |

Each project brief adds **domain-specific routes and screens** below its user journeys.

---

## Backend expectations (all projects)

How the domain API in `apps/api` should be structured. Auth stays on the gateway — do not rebuild login here.

### Folder layout (per domain module)

```text
apps/api/src/modules/<name>/
  <name>.module.ts
  <name>.controller.ts
  <name>.service.ts
  <name>.entity.ts
  dto/
    create-<name>.dto.ts
    update-<name>.dto.ts
    list-<name>-query.dto.ts   # pagination + filters
```

Register each module in `app.module.ts`. One module per main aggregate (e.g. `jobs`, `orders`, `tickets`).

### Layer responsibilities

| Layer          | Responsibility                                              | Should not                                                            |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| **Controller** | HTTP mapping, DTO validation, `@Roles()`, call service      | Business rules, direct repository logic for invariants                |
| **Service**    | Invariants, ownership checks, transactions, orchestration   | Return raw entities without envelope (interceptor handles `{ data }`) |
| **Entity**     | Columns, relations, soft-delete column, indexes/constraints | Auth fields (email, password, role)                                   |
| **DTO**        | class-validator decorators; whitelist-safe shapes           | Trust client-sent `userId` for ownership without verifying            |

### API conventions

| Topic              | Expectation                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Envelope**       | Success responses: `{ data: T }` via shared HTTP interceptors                                                                   |
| **Errors**         | 4xx with `{ statusCode, error, message, details? }`; invariant failures use clear messages (e.g. "Already applied to this job") |
| **Validation**     | Global `ValidationPipe`: `whitelist: true`, `forbidNonWhitelisted: true` on all body/query DTOs                                 |
| **List endpoints** | `GET /resources?page=&limit=` plus ≥2 query filters; return paginated shape with `items` + `total` (or equivalent)              |
| **Soft delete**    | `deletedAt` column; list queries exclude deleted by default                                                                     |
| **Auth**           | JWT from gateway (cookie → Bearer hop); `@Roles('admin' \| 'staff' \| 'user')` on protected routes                              |
| **Ownership**      | Service verifies `entity.userId === currentUser.id` (or membership) before mutate — never trust URL alone                       |
| **Users**          | Store `userId` UUID FK only — users table lives in gateway DB                                                                   |

### Database and migrations

- `synchronize: false` — all schema changes via migrations in `apps/api/src/database/migrations/`
- Run `pnpm migration:run:api` after adding migrations; domain seed ≥8 realistic rows
- Prefer DB constraints that mirror invariants: `UNIQUE`, `CHECK`, foreign keys with `ON DELETE` where appropriate
- Multi-step writes (checkout, book slot, close job) use `DataSource.transaction()` or equivalent

### OpenAPI

- Controllers decorated with `@ApiTags`, `@ApiOperation` where practical
- Local docs at `http://localhost:3002/docs` (Bearer JWT) for testing domain endpoints

Each project brief adds **domain-specific modules and endpoints** below its user journeys.

---

## Build readiness — can you implement from the brief alone?

**Yes**, if you read in this order:

1. **Problem** + **Application flow** — why and what
2. **[Implementation standards](#implementation-standards-all-projects)** (this page) — pagination, errors, IDs
3. Your brief’s **Backend expectations** (modules, key endpoints, enums, constraints, seed) — authoritative for entities, enums, API paths, and locked decisions
4. **User journeys** — plain-language stories of who does what and what they should see
5. **Frontend / Backend expectations** — module layout and page patterns
6. **Edge cases** + **FAQ** — pre-answered instructor questions

On conflict: your brief’s **Backend expectations** (enums, constraints, seed) wins, then this README’s implementation standards, then other brief sections.

Each brief includes:

| Section              | Answers                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Roles in detail      | Gateway mapping + can/cannot per persona                                                     |
| Backend expectations | Modules, key endpoints, enums, state machines, DB constraints, seed minimums, web route auth |
| User journeys        | Human-readable scenarios per role — what users do and what should happen                     |
| Edge cases & FAQ     | Domain-specific 4xx/409 cases and “which option?” decisions                                  |

`docs/architecture.md` is for **your** ERD notes and demo script — not for inventing requirements the brief left open.

---

## Implementation standards (all projects)

Locked defaults for every capstone domain. Individual brief **Backend expectations** sections may add domain rules but must not contradict these unless `docs/architecture.md` documents an approved exception.

| Topic                                     | Locked default                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| **Pagination response**                   | `{ data: { items, total, page, limit } }`                                            |
| **Pagination params**                     | `page=1`, `limit=20` when omitted; max `limit=100`                                   |
| **Invalid pagination**                    | `page < 1` → **400**; `limit < 1` or `limit > 100` → **400**                         |
| **Conflict errors**                       | Always **409** (duplicate apply, oversell, double enrollment, …)                     |
| **Validation errors**                     | **400** with `{ statusCode, error, message, details? }`                              |
| **Wrong role / not owner**                | **403**                                                                              |
| **Not found / soft-deleted to non-owner** | **404**                                                                              |
| **IDs**                                   | UUID v4 (`uuid` column type)                                                         |
| **Timestamps**                            | `timestamptz` stored in UTC                                                          |
| **Audit columns**                         | Every entity: `createdAt`, `updatedAt`; soft-delete resources also `deletedAt`       |
| **Text search**                           | PostgreSQL `ILIKE` partial match unless the brief specifies otherwise                |
| **Empty query params**                    | Empty strings ignored (treated as no filter)                                         |
| **Owner fields**                          | Set from JWT (`@CurrentUser()`); never accept `userId` / owner IDs from request body |
| **Public catalog**                        | Each brief's **Backend expectations** section lists which GET routes are `@Public()` |

---

## FAQ — read before you ask

Decisions that apply to **every** project. Your brief may override for domain specifics.

### Repo and scope

| Question                                                         | Answer                                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Do I build auth (login/register) in `apps/api`?                  | **No.** Auth stays on `apps/api-gateway`. Domain API stores `userId` UUID FKs only. |
| Do I need a `User` entity in the domain API?                     | **No.** Never duplicate email, password, or role columns in `apps/api`.             |
| Can I call `http://localhost:3002` from the browser?             | **No.** Browser uses `/api` on `:3000` only (Next rewrite → gateway → api).         |
| Can I store JWT in `localStorage`?                               | **No.** Cookie JWT from gateway only ([stack.md](../stack.md)).                     |
| Can I use `synchronize: true` in TypeORM for faster dev?         | **No.** Migrations only. Run `pnpm migration:run:api` for domain tables.            |
| Can I rename `@app/*` / `@shared/*` packages to my project name? | **No.** Keep package scopes; put domain code in modules/pages.                      |
| Which migrations go where?                                       | Users: `pnpm migration:run` (gateway). Domain: `pnpm migration:run:api`.            |
| What does “≥8 seed rows” mean?                                   | **≥8 domain rows** across your entities (jobs, products, …) — not 8 user accounts.  |
| Do I need a separate repo?                                       | **No.** One branch in this monorepo: `<name>/<slug>`.                               |
| Can I skip Should / Stretch and still pass?                      | **Yes** if all **Must** items (brief + [grading.md](../grading.md)) are done.       |

### Roles and auth

| Question                                                     | Answer                                                                                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration creates which role?                             | Always `user`. Use seeded accounts (after `pnpm seed`) to demo `staff` and `admin`.                                                                           |
| Must I use exactly `admin` / `staff` / `user` in `@Roles()`? | **Yes** — those are the gateway JWT role values. Map them to domain labels in UI (e.g. “Company”, “Instructor”).                                              |
| Is showing the role in the header enough?                    | **No.** Roles must change API rules and/or visible screens ([grading](../grading.md)).                                                                        |
| Should UI hide buttons the user cannot use?                  | **Yes.** Do not rely on API 403 alone — hide/disable unauthorized actions.                                                                                    |
| Can `admin` do everything `user` and `staff` can?            | **No** — admin must have at least one unique capability (e.g. suspend, force-close, global list). Admin is not required to inherit every lower-role mutation. |
| 401 vs 403?                                                  | **401** = not logged in. **403** = logged in but wrong role or not owner.                                                                                     |
| Public browse without login (e.g. job list)?                 | **Yes for catalog GET routes listed in your brief’s Backend expectations** — mark those `@Public()` on the API; all mutations require auth.                   |

### API and data

| Question                                                         | Answer                                                                                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Response shape?                                                  | Success: `{ data: T }`. Error: `{ statusCode, error, message, details? }`.                                                                             |
| Status code for invariant violation (duplicate apply, oversell)? | **409 Conflict** — always, project-wide.                                                                                                               |
| Status code for wrong role?                                      | **403 Forbidden**.                                                                                                                                     |
| Status code for not found / soft-deleted?                        | **404 Not Found** (do not leak soft-deleted resources to non-admin).                                                                                   |
| Pagination defaults?                                             | `page=1`, `limit=20` if omitted; cap `limit` at **100** max.                                                                                           |
| Empty filter string (`?q=`)?                                     | Treat as **no filter**, not “match empty string”.                                                                                                      |
| Can client send `userId` in body to set owner?                   | **No.** Set owner from `@CurrentUser()` in the service.                                                                                                |
| Soft delete: hard `DELETE` or `PATCH deletedAt`?                 | **`DELETE /resource/:id` HTTP verb** that sets `deletedAt` (no hard delete on the graded list resource). List queries exclude `deletedAt IS NOT NULL`. |
| Idempotency required?                                            | **No** for Must tier — but use DB unique constraints to survive double-submit.                                                                         |
| Date/time storage?                                               | **UTC in Postgres** (`timestamptz`); local display in UI is fine.                                                                                      |
| Money amounts?                                                   | Store **integers in cents** (or smallest unit) to avoid float bugs — especially expense split, ecommerce, finance.                                     |

### Frontend

| Question                                   | Answer                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| TanStack Query vs Redux?                   | **Query** = server data (lists, detail, mutations). **RTK** = filters, drafts, UI selection only. |
| Can I keep server list in Redux?           | **No** — that violates [grading.md](../grading.md).                                               |
| Must I use `@shared/ui/components`?        | **Yes** for domain UI (buttons, forms, tables, empty/loading states).                             |
| Custom colors / Tailwind arbitrary values? | Avoid — use semantic tokens ([frontend.md](../frontend.md)).                                      |
| Double-click submit?                       | Disable submit / show loading while mutation pending.                                             |
| After create, list still stale?            | **Invalidate** Query cache or refetch list on success.                                            |

### Grading and demo

| Question                             | Answer                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| What if I only finish Must on day 6? | That is a **pass** if demo and docs are complete.                                                |
| Must demo show a failure case?       | **Yes** — show at least one invariant/validation **4xx** ([grading](../grading.md) demo script). |
| Where does demo script go?           | PR body **and** `docs/architecture.md`.                                                          |
| Do I need unit tests to pass?        | Not explicitly in Must — but `pnpm test` must pass in CI for submission.                         |
| Can Stretch be mocked?               | **Yes** (e.g. mock payment) — Must/Should must work without Stretch.                             |

---

## Edge cases and negative scenarios (all projects)

Handle these in API **and** reflect them in UI where relevant. Each brief adds domain-specific rows.

### Auth and access

| Scenario                                 | Expected behaviour                                                 |
| ---------------------------------------- | ------------------------------------------------------------------ |
| No cookie / expired JWT on protected API | **401**; web redirects to `/login` (except auth routes).           |
| Valid JWT but wrong `@Roles()`           | **403** with clear message.                                        |
| User A accesses User B’s resource by ID  | **403** or **404** — prefer **404** if you want to hide existence. |
| Unauthenticated user hits protected page | Redirect to login or show login prompt.                            |

### Validation and bad input

| Scenario                                | Expected behaviour                                                         |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Missing required field on POST/PATCH    | **400** + `details` array from ValidationPipe.                             |
| Unknown field in JSON body              | **400** (`forbidNonWhitelisted: true`).                                    |
| Invalid UUID in `:id` param             | **400** or **404** — be consistent.                                        |
| `page=0`, negative `page`, or `limit=0` | **400 Bad Request** — do not silently clamp (except empty filter strings). |
| `limit=10000`                           | **400 Bad Request** when `limit > 100`.                                    |

### Lists, pagination, soft-delete

| Scenario                                          | Expected behaviour                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| No rows match filters                             | **200** with empty `items[]` — not an error.                                                 |
| Soft-deleted resource in default list             | **Must not appear.**                                                                         |
| GET soft-deleted resource by ID (non-admin)       | **404** — do not leak that the resource existed.                                             |
| Frontend navigates to a soft-deleted resource URL | Show a "no longer available" page or redirect to the list — do not show a blank/broken page. |
| Page beyond last page                             | **200** with empty `items[]`.                                                                |

### Concurrency and duplicates

| Scenario                                               | Expected behaviour                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Double-submit same mutation (double-click)             | UI prevents via loading state; DB unique constraint as backstop → **409**.              |
| Two users racing on same scarce resource (slot, stock) | **One wins**, other gets **409/400** — use transaction + row lock or unique constraint. |

### Frontend negative states

| Scenario                                            | Expected behaviour                                                |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| Query fetch fails (500, network)                    | Error UI with message + retry — not infinite spinner.             |
| Mutation fails (4xx)                                | Show API `message`; keep form data so user can fix.               |
| Empty first-use list                                | `EmptyState` with action (“Create your first …”).                 |
| Unauthorized action clicked (if visible by mistake) | Toast/alert from API error — should be rare if nav is role-gated. |

### Common mistakes — do not do these

- Rebuilding login/register in `apps/api` or storing passwords in domain tables.
- Putting entity arrays from the server in Redux.
- Using `synchronize: true` instead of migrations.
- Skipping empty/loading/error states on list pages.
- No `@Roles()` on API because “UI hides the button”.
- Hard-deleting the main graded list resource with no soft-delete story.
- Demo only showing happy path — graders expect a 4xx invariant demo.
- Asking “what pagination format?” — use `{ data: { items, total, page, limit } }` per [Implementation standards](#implementation-standards-all-projects).

### Troubleshooting setup (not grading questions)

| Symptom                           | Check                                                                       |
| --------------------------------- | --------------------------------------------------------------------------- |
| `401` on all API calls            | Logged in? Cookie set? Same `JWT_SECRET` in gateway + api `.env`.           |
| `pnpm doctor` fails on api        | `pnpm docker:db` running? `DATABASE_URL` correct? `pnpm migration:run:api`. |
| Empty domain after seed           | Domain seed is **your** script — gateway `pnpm seed` only creates users.    |
| CORS errors from browser          | You should not call `:3001`/`:3002` directly — use `/api` on `:3000`.       |
| TypeORM “relation does not exist” | Run `pnpm migration:run:api`; never use `synchronize: true`.                |
| Role always `user` after register | Expected — use seeded `staff`/`admin` accounts for elevated demo roles.     |

---

## Pick your project

| #   | Project               | Slug                    | Summary                                     | Brief                               |
| --- | --------------------- | ----------------------- | ------------------------------------------- | ----------------------------------- |
| 1   | Job Portal            | `job-portal`            | Jobs, applications, company/candidate roles | [01](./01-job-portal.md)            |
| 2   | E-commerce            | `ecommerce-marketplace` | Products, cart, checkout, reviews           | [02](./02-ecommerce-marketplace.md) |
| 3   | Project Management    | `project-management`    | Boards, issues, sprints                     | [03](./03-project-management.md)    |
| 4   | LMS                   | `lms`                   | Courses, lessons, quizzes, grades           | [04](./04-lms.md)                   |
| 5   | Hospital Appointments | `hospital-appointments` | Slots, schedules, prescriptions             | [05](./05-hospital-appointments.md) |
| 6   | Expense Split         | `expense-split`         | Shared expenses and balances                | [06](./06-expense-split.md)         |
| 7   | Hotel Booking         | `hotel-booking`         | Rooms, availability, reviews                | [07](./07-hotel-booking.md)         |
| 8   | Food Delivery         | `food-delivery`         | Menus, orders, delivery status              | [08](./08-food-delivery.md)         |
| 9   | CMS / Blogging        | `cms-blogging`          | Drafts, publish, comments                   | [09](./09-cms-blogging.md)          |
| 10  | Inventory             | `inventory-warehouse`   | Stock, warehouses, transfers                | [10](./10-inventory-warehouse.md)   |
| 11  | CRM                   | `crm`                   | Leads, deals, pipeline                      | [11](./11-crm.md)                   |
| 12  | Support Desk          | `support-desk`          | Tickets, agents, SLAs                       | [12](./12-support-desk.md)          |
| 13  | Property Rental       | `property-rental`       | Listings, bookings, leases                  | [13](./13-property-rental.md)       |
| 14  | Event Management      | `event-management`      | Events, RSVPs, check-in                     | [14](./14-event-management.md)      |
| 15  | Fitness Tracker       | `fitness-tracker`       | Workouts, goals, progress                   | [15](./15-fitness-tracker.md)       |
| 16  | Finance Tracker       | `finance-tracker`       | Accounts, budgets, transactions             | [16](./16-finance-tracker.md)       |
| 17  | Library               | `library-management`    | Catalog, borrow, fines                      | [17](./17-library-management.md)    |

Each brief includes:

- **Problem** — context, actors, pain points, and what you are building
- **Application flow** — end-to-end steps through the system
- **Roles in detail** — what each persona can and cannot do
- **User journeys** — clear, detailed scenarios in plain language (who, goal, numbered steps)
- **What is expected** — Must / Should / Stretch explained in plain language
- **Frontend expectations** — domain screens, layout, and UI behaviour ([shared FE bar](#frontend-expectations-all-projects))
- **Backend expectations** — domain modules, endpoints, and service rules ([shared BE bar](#backend-expectations-all-projects))
- **Backend expectations** — modules, key endpoints, enums, state machines, DB constraints, seed counts, web route auth ([shared standards](#implementation-standards-all-projects))
- **Edge cases and FAQ** — failures and quick answers (Backend expectations wins on conflict)
