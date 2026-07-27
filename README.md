# Fullstack boilerplate

Nest + Next monorepo starter. Shared Nest API (`apps/api/`) and Next app (`apps/web/`). Implement your assigned domain on a personal branch.

## Quick start

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
pnpm docker:db

pnpm migration:run
pnpm seed
pnpm dev          # API :3001 + web :3000
```

Requires **Node ≥ 20**, **pnpm 10.18.1**, and **Docker** (for Postgres).

Seed logins: `admin@fullstack.local` / `user@fullstack.local` / `staff@fullstack.local` — password `password123`.

## How work is organized

| Piece               | Where                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Nest domain modules | `apps/api/src/modules/`                                                                                                                     |
| Next UI             | `apps/web/app/`                                                                                                                             |
| Shared libs         | `libs/` — active: `@repo/env`, `@repo/api-client`, `@repo/ui`, `@repo/shared-types`, `@repo/config`; stubs: `@repo/database`, `@repo/utils` |
| Tools / Docker      | `tools/scripts/`, `docker/docker-compose.yml` (Postgres only; `Dockerfile.*` are unused stubs)                                              |
| Project briefs      | `docs/projects/`                                                                                                                            |
| Architecture notes  | [`docs/architecture.md`](docs/architecture.md)                                                                                              |

Branch format: **`<dev-name>/<slug>`** (example: `ada/job-portal`). See [submission](docs/submission.md).

## Projects (17)

| Slug                    | Title                  | Brief                                             |
| ----------------------- | ---------------------- | ------------------------------------------------- |
| `job-portal`            | Job Portal             | [docs](docs/projects/01-job-portal.md)            |
| `ecommerce-marketplace` | E-commerce Marketplace | [docs](docs/projects/02-ecommerce-marketplace.md) |
| `project-management`    | Project Management     | [docs](docs/projects/03-project-management.md)    |
| `lms`                   | LMS                    | [docs](docs/projects/04-lms.md)                   |
| `hospital-appointments` | Hospital Appointments  | [docs](docs/projects/05-hospital-appointments.md) |
| `expense-split`         | Expense Split          | [docs](docs/projects/06-expense-split.md)         |
| `hotel-booking`         | Hotel Booking          | [docs](docs/projects/07-hotel-booking.md)         |
| `food-delivery`         | Food Delivery          | [docs](docs/projects/08-food-delivery.md)         |
| `cms-blogging`          | CMS / Blogging         | [docs](docs/projects/09-cms-blogging.md)          |
| `inventory-warehouse`   | Inventory & Warehouse  | [docs](docs/projects/10-inventory-warehouse.md)   |
| `crm`                   | CRM                    | [docs](docs/projects/11-crm.md)                   |
| `support-desk`          | Support Desk           | [docs](docs/projects/12-support-desk.md)          |
| `property-rental`       | Property Rental        | [docs](docs/projects/13-property-rental.md)       |
| `event-management`      | Event Management       | [docs](docs/projects/14-event-management.md)      |
| `fitness-tracker`       | Fitness Tracker        | [docs](docs/projects/15-fitness-tracker.md)       |
| `finance-tracker`       | Finance Tracker        | [docs](docs/projects/16-finance-tracker.md)       |
| `library-management`    | Library Management     | [docs](docs/projects/17-library-management.md)    |

Assignments live in your instructor’s Google Sheet. Column template: [`assignments.example.csv`](assignments.example.csv).

## Docs

- [Stack rules](docs/stack.md)
- [Architecture](docs/architecture.md)
- [ADRs](docs/adr/0001-monorepo-tooling.md)
- [Grading (Must / Should / Stretch)](docs/grading.md)
- [Submission](docs/submission.md)
- [Contributing](CONTRIBUTING.md)

## Boilerplate

Shared apps already include cookie JWT auth, ValidationPipe, exception filter, response interceptor, users migration/seed, and Next login/register with Query + RTK providers.

Add your domain on top — do not leave the auth-only shell as your final submission.

## Quality bar

- Strict TypeScript
- Cookie JWT only (no localStorage tokens)
- Migrations only (`synchronize: false`)
- Query for server state; RTK for drafts/filters/selection
- CI: `pnpm install --frozen-lockfile`, typecheck, lint, lint:sonar, test
- Soft-delete on the primary listable resource (see [grading](docs/grading.md))
