# Project Management (Jira-style)

A lightweight Jira-style app: **projects** with membership, **issues** with a status
workflow, **comments**, **labels**, **filters**, **sprints**, and an **activity log**.
Only project members may mutate issues, and every status change is recorded in the same
transaction as the update.

Built on a Nest + Next monorepo. Backend domain code lives in `apps/api` (NestJS +
TypeORM + Postgres); the UI in `apps/web` (Next App Router + TanStack Query + RTK).
Auth is reused from `apps/api-gateway` — no users/passwords are recreated in the domain
API; it stores `userId` UUID FKs only.

- **Architecture, ERD, invariants, demo script:** [docs/architecture.md](docs/architecture.md)
- **Backend study guide (module-by-module):** [docs/backend-walkthrough.md](docs/backend-walkthrough.md)

```text
Browser → web :3000  (/api/*)
              ↓ rewrite
         gateway :3001  (login / cookies)
              ↓ Bearer JWT
         api :3002  (domain modules)
              ↓
         Postgres :5432
```

## Quick start

Needs **Node ≥ 20**, **pnpm 10.18.1**, and a **Postgres** instance running on
`localhost:5432` with a `project_management_db` database (match `DATABASE_URL` in your
`.env` files).

Run all commands from the **repo root**. Install once — do **not** run `pnpm install`
inside any `apps/*` folder.

```bash
pnpm install
cp .env.example .env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

pnpm migration:run         # gateway: users table
pnpm migration:run:api     # domain: projects, issues, labels, sprints…

pnpm seed                  # gateway: demo users (see accounts below)
pnpm --filter @app/api seed  # domain: 2 projects, 6 issues, labels, comments, 1 sprint

pnpm dev                   # web + gateway + api
pnpm doctor                # verify every hop is healthy
```

Then open **http://localhost:3000** — you'll be redirected to `/projects` once logged in.

> Re-running the domain seed appends duplicate projects (by design — no unique on name).
> For a clean slate: drop and recreate the database, then re-run both `migration:run*` and both seeds.

## Login accounts

Created by `pnpm seed`. Password for all: **`password123`**.

| Email              | Role                     | In the app                                                                                                                                |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `staff@demo.local` | staff → **project_lead** | Creates projects; manages members, labels, sprints; deletes issues. Lead on both seed projects.                                           |
| `user@demo.local`  | user → **member**        | Works issues, comments, changes status. Member of **BlueLightCard only** — hitting Modulo LABS demonstrates the 403 membership invariant. |
| `admin@demo.local` | admin                    | Read-all override across every project.                                                                                                   |

Seed projects: **BlueLightCard** (`BLC`) and **Modulo LABS** (`MOD`).

## Key routes (web)

| Route                  | What                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `/projects`            | Projects you belong to; staff/admin see a create form                 |
| `/projects/:id`        | Project overview + members + links to board/issues                    |
| `/projects/:id/board`  | Kanban board — columns by status, move buttons per allowed transition |
| `/projects/:id/issues` | Filterable + paginated issues table (status, label — RTK-driven)      |
| `/issues/:id`          | Issue detail — description, labels, activity timeline, comments       |
| `/dashboard`           | Your open (non-done) issues across all your projects                  |

API endpoint tables live in the
[design spec](docs/superpowers/specs/2026-08-15-project-management-design.md#endpoints).

## API docs (Swagger)

Available in local/dev once the apps are running:

| Service    | Swagger UI                 | OpenAPI JSON                    | Auth       |
| ---------- | -------------------------- | ------------------------------- | ---------- |
| Gateway    | http://localhost:3001/docs | http://localhost:3001/docs/json | Cookie JWT |
| Domain API | http://localhost:3002/docs | http://localhost:3002/docs/json | Bearer JWT |

## Where the domain code lives

| You build…                                   | Put it in…                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Domain API (entities, services, controllers) | `apps/api/src/modules/` (`projects`, `issues`, `labels`, `sprints`)                                   |
| UI pages and app components                  | `apps/web/app/` and `apps/web/components/`                                                            |
| Shared UI kit (prefer these)                 | `@shared/ui/components` — `@shared/ui/theme.css` · gallery `/ui` · [frontend guide](docs/frontend.md) |
| Auth / cookie login                          | Already in `apps/api-gateway/` — usually leave it                                                     |

Package scopes are project-agnostic: `@app/*` for apps, `@shared/*` for libs.

## Commands

**Run apps**

```bash
pnpm dev          # web + gateway + api together
pnpm dev:api      # one at a time (order: api → gateway → web)
pnpm dev:gateway
pnpm dev:web
pnpm doctor       # env, Postgres, ports, per-hop health
```

**Database**

| Script                           | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `pnpm migration:run` / `:api`    | Run gateway / domain migrations          |
| `pnpm migration:generate`        | Generate a domain migration              |
| `pnpm migration:revert` / `:api` | Revert latest gateway / domain migration |
| `pnpm seed`                      | Seed demo users (gateway)                |
| `pnpm --filter @app/api seed`    | Seed domain data (projects, issues, …)   |

**Checks**

| Script                                               | Purpose                             |
| ---------------------------------------------------- | ----------------------------------- |
| `pnpm typecheck` / `typecheck:api` / `typecheck:web` | Type checks                         |
| `pnpm test` / `test:api` / `test:gateway`            | Jest                                |
| `pnpm test:coverage`                                 | Coverage thresholds (CI gate)       |
| `pnpm lint` / `lint:all`                             | ESLint (+ Sonar rules) / lint + CSS |
| `pnpm build` / `start`                               | Production build / run              |

## Ports

| Port | App                           |
| ---- | ----------------------------- |
| 3000 | Web (browser only talks here) |
| 3001 | API gateway                   |
| 3002 | Domain API                    |
| 5432 | Postgres                      |
