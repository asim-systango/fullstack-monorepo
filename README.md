# Fullstack boilerplate

Shared Nest + Next starter for your capstone. You build your assigned domain here — not in a separate repo.

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

| Check        | Command / URL                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Smoke / hops | `pnpm doctor` (api → gateway → Next rewrite) or `curl -sS http://localhost:3000/api/ready`          |
| Demo logins  | `admin@fullstack.local` / `user@fullstack.local` / `staff@fullstack.local` — password `password123` |

## Where you write code

| You build…                                   | Put it in…                                        |
| -------------------------------------------- | ------------------------------------------------- |
| Domain API (entities, services, controllers) | `apps/api/src/modules/`                           |
| UI pages and components                      | `apps/web/app/` and `apps/web/components/`        |
| Auth / cookie login                          | Already in `apps/api-gateway/` — usually leave it |

Branch: **`<your-name>/<project-slug>`** (example: `ada/job-portal`). See [submission](docs/submission.md).

## Commands

**All three apps together**

```bash
pnpm dev          # web + gateway + api
pnpm doctor       # env, Postgres, ports, per-hop health (api / gateway / rewrite)
```

**One app at a time** (order: api → gateway → web)

```bash
pnpm dev:api
pnpm dev:gateway
pnpm dev:web
```

| Script                             | Purpose                     |
| ---------------------------------- | --------------------------- |
| `pnpm docker:db` / `docker:down`   | Start / stop Postgres       |
| `pnpm migration:run`               | Users table (gateway)       |
| `pnpm migration:run:api`           | Your domain migrations      |
| `pnpm migration:generate`          | Generate a domain migration |
| `pnpm seed`                        | Seed demo users             |
| `pnpm typecheck` / `lint` / `test` | Local checks                |
| `pnpm build` / `start`             | Production build / run      |

Also: `dev:backend`, `build:*`, `start:*`, `typecheck:*` per app.

## Ports

| Port | App                           |
| ---- | ----------------------------- |
| 3000 | Web (browser only talks here) |
| 3001 | API gateway                   |
| 3002 | Domain API                    |
| 5434 | Postgres                      |

If a port is taken, change that app’s `PORT` and keep these in sync: `API_UPSTREAM_URL` (gateway → api), `API_GATEWAY_URL` (web → gateway). Then run `pnpm doctor`.

`JWT_SECRET` must be the same in `apps/api-gateway/.env` and `apps/api/.env`.

## Projects (17)

Your assignment is in the instructor’s Google Sheet. Full Must / Should / Stretch live in each brief.

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

Column template: [`assignments.example.csv`](assignments.example.csv).

## More docs

- [Stack rules](docs/stack.md)
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
- Do not submit the auth-only shell; add your domain on top
