# App starter

Shared Nest + Next monorepo starter. You build your assigned domain here — not in a separate repo.

Package scopes are **project-agnostic** (reuse this starter without renaming packages):

| Scope       | What                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- |
| `@app/*`    | Apps: `@app/web`, `@app/api-gateway`, `@app/api`                                            |
| `@shared/*` | Libs: `@shared/env`, `@shared/http`, `@shared/ui`, `@shared/api-client`, `@shared/types`, … |

```text
Browser → web :3000  (/api/*)
              ↓ rewrite
         gateway :3001  (login / cookies)
              ↓
         api :3002  (your domain code)
              ↓
         Postgres :5434
```

## Start here

Run all commands from the **repo root** (this folder). Install once — do **not** run `pnpm install` / `npm i` inside `apps/web`, `apps/api`, or `apps/api-gateway`.

```bash
pnpm install
cp .env.example .env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

pnpm docker:db
pnpm migration:run
pnpm seed
pnpm dev
pnpm doctor
```

Then open **http://localhost:3000**.

Needs **Node ≥ 20**, **pnpm 10.18.1**, and **Docker**.

| Check        | Command / URL                                                                               |
| ------------ | ------------------------------------------------------------------------------------------- |
| Smoke / hops | `pnpm doctor` (api → gateway → Next rewrite) or `curl -sS http://localhost:3000/api/ready`  |
| Demo users   | Run `pnpm seed` — one account per gateway role (`admin`, `staff`, `user`) for local testing |

## Where you write code

| You build…                                   | Put it in…                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Domain API (entities, services, controllers) | `apps/api/src/modules/`                                                                               |
| UI pages and app components                  | `apps/web/app/` and `apps/web/components/`                                                            |
| Shared UI kit (prefer these)                 | `@shared/ui/components` — `@shared/ui/theme.css` · gallery `/ui` · [frontend guide](docs/frontend.md) |
| Auth / cookie login                          | Already in `apps/api-gateway/` — usually leave it                                                     |

Branch: **`<your-name>/<project-slug>`** (example: `ada/job-portal`). See [submission](docs/submission.md).

## Commands

**All three apps together**

```bash
pnpm dev          # web + gateway + api
pnpm doctor       # env, Postgres, ports, per-hop health (api /ready → gateway /health → gateway /ready proxy → Next /api/ready)
```

**One app at a time** (order: api → gateway → web)

```bash
pnpm dev:api
pnpm dev:gateway
pnpm dev:web
```

| Script                             | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `pnpm docker:db` / `docker:down`   | Start / stop Postgres                                           |
| `docker/Dockerfile.*`              | Optional deploy stubs (gateway, api, web) — not used by Compose |
| `pnpm migration:run`               | Users table (gateway)                                           |
| `pnpm migration:run:api`           | Your domain migrations                                          |
| `pnpm migration:generate`          | Generate a domain migration                                     |
| `pnpm migration:revert` / `:api`   | Revert latest gateway / domain migration                        |
| `pnpm seed`                        | Seed demo users                                                 |
| `pnpm typecheck` / `lint` / `test` | Local checks                                                    |
| `pnpm test:coverage`               | Jest + coverage thresholds (CI gate)                            |
| `pnpm test:gateway` / `test:api`   | Per-app Jest                                                    |
| `pnpm build` / `start`             | Production build / run                                          |

Also: `dev:backend`, `build:*`, `start:*`, `typecheck:*` per app.

## Ports

| Port | App                           |
| ---- | ----------------------------- |
| 3000 | Web (browser only talks here) |
| 3001 | API gateway                   |
| 3002 | Domain API                    |
| 5434 | Postgres                      |

OpenAPI (non-production): gateway `http://localhost:3001/docs` · domain API `http://localhost:3002/docs`.

If a port is taken, change that app’s `PORT` and keep these in sync: `API_UPSTREAM_URL` (gateway → api), `API_GATEWAY_URL` (web → gateway). Then run `pnpm doctor`.

`JWT_SECRET` must be the same in `apps/api-gateway/.env` and `apps/api/.env`.

## Projects (17)

Pick **one** project brief and read it **fully before coding**. Recommended order within the brief:

1. **Problem** → **Application flow** → **Roles in detail**
2. **Backend & Frontend expectations** (modules, key endpoints, enums, constraints, screens)
3. **User journeys** ← manual test script while building
4. **Edge cases / FAQ** + **DoD / Demo script**

Each brief includes:

- **Problem** — real-world context, actors, pain points, and scope
- **Application flow** — step-by-step end-to-end behaviour
- **Roles in detail** — what admin / staff / user can and cannot do in your domain
- **User journeys** — detailed manual test script (6+ steps per scenario)
- **What is expected** — Must / Should / Stretch explained in plain language
- **Frontend expectations** — domain screens, UI layout, states, and behaviour
- **Backend expectations** — domain modules, endpoints, database constraints, enums, state machines, and service-layer rules
- **Edge cases and FAQ** — failures, decisions, and pre-answered questions ([shared FAQ](docs/projects/README.md#faq--read-before-you-ask))
- **Suggested demo script** — starting point for your PR

Shared setup, role mapping, FE/BE standards, and grading: [docs/projects/README.md](docs/projects/README.md).

| Slug                    | What you build                                         | Brief                                             |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| `job-portal`            | Companies post jobs; candidates apply and track status | [docs](docs/projects/01-job-portal.md)            |
| `ecommerce-marketplace` | Sellers list products; buyers cart, checkout, review   | [docs](docs/projects/02-ecommerce-marketplace.md) |
| `project-management`    | Boards, issues, sprints, labels, comments              | [docs](docs/projects/03-project-management.md)    |
| `lms`                   | Courses, lessons, quizzes, enrollment, grading         | [docs](docs/projects/04-lms.md)                   |
| `hospital-appointments` | Doctor slots, schedules, prescriptions                 | [docs](docs/projects/05-hospital-appointments.md) |
| `expense-split`         | Shared expenses, balances, settlements                 | [docs](docs/projects/06-expense-split.md)         |
| `hotel-booking`         | Rooms by date, bookings, reviews                       | [docs](docs/projects/07-hotel-booking.md)         |
| `food-delivery`         | Menus, cart, order status through delivery             | [docs](docs/projects/08-food-delivery.md)         |
| `cms-blogging`          | Drafts, tags, comments, publish workflow               | [docs](docs/projects/09-cms-blogging.md)          |
| `inventory-warehouse`   | Stock, warehouses, transfers, POs                      | [docs](docs/projects/10-inventory-warehouse.md)   |
| `crm`                   | Leads, customers, deals, notes, tasks                  | [docs](docs/projects/11-crm.md)                   |
| `support-desk`          | Tickets, agents, SLAs, attachments                     | [docs](docs/projects/12-support-desk.md)          |
| `property-rental`       | Listings, bookings, leases, messaging                  | [docs](docs/projects/13-property-rental.md)       |
| `event-management`      | Events, RSVPs, waitlists, check-in                     | [docs](docs/projects/14-event-management.md)      |
| `fitness-tracker`       | Workouts, PRs, plans, goals                            | [docs](docs/projects/15-fitness-tracker.md)       |
| `finance-tracker`       | Accounts, budgets, transactions, goals                 | [docs](docs/projects/16-finance-tracker.md)       |
| `library-management`    | Titles, copies, borrow/reserve, fines                  | [docs](docs/projects/17-library-management.md)    |

## More docs

- [Stack rules](docs/stack.md)
- [Frontend / UI kit](docs/frontend.md)
- [Architecture](docs/architecture.md)
- [Grading](docs/grading.md)
- [Submission](docs/submission.md)
- [Optional extra service](docs/adding-a-service.md) (Stretch)
- [Contributing](CONTRIBUTING.md)

## Quality bar

- Cookie JWT only (no `localStorage` tokens) — browser uses `/api` on `:3000`
- TypeORM migrations only (`synchronize: false`)
- TanStack Query for server data; RTK for drafts/filters only
- Soft-delete on the primary listable resource — see [grading](docs/grading.md)
- Prefer `@shared/ui/components` + theme tokens over one-off styles — see [frontend](docs/frontend.md)
- Do not submit the auth-only shell; add your domain on top
