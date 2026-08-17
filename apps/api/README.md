# Splitter API (`apps/api`)

NestJS backend for **Splitter** — an expense-sharing app with auth, groups, invites, expenses, computed balances, and settlements. Runs on **http://localhost:3002**.

The web app (`apps/web` on `:3000`) proxies `/api/*` to this service. Auth uses an httpOnly `access_token` cookie (JWT).

---

## Prerequisites

| Requirement | Version                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| Node.js     | ≥ 20                                                                     |
| pnpm        | 10.18.1 (see root `packageManager`)                                      |
| PostgreSQL  | 16 (Docker image provided) or local install                              |
| SMTP        | Gmail app password or any SMTP server (for email verification & invites) |

Install dependencies once from the **monorepo root**:

```bash
pnpm install
```

---

## Quick start (5 steps)

Run these from the **repository root** unless noted otherwise.

### 1. Start PostgreSQL

**Option A — Docker (recommended)**

```bash
cp .env.example .env          # root .env for Docker Compose
pnpm docker:db                # Postgres on localhost:5434, database `app`
```

**Option B — Local PostgreSQL**

Use your own instance on port `5432` and create a database (e.g. `splitter`).

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`. Minimum values to change:

- `AUTH_JWT_SECRET` — at least 16 characters
- `MAIL_USER` / `MAIL_PASSWORD` — SMTP credentials for verification & invite emails
- Database — match your Postgres setup (see [Database configuration](#database-configuration))

**Docker Compose example** (Postgres from step 1):

```env
DATABASE_HOST=localhost
DATABASE_PORT=5434
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=app
```

### 3. Run migrations

```bash
pnpm migration:run:api
```

Creates all Splitter tables in the `migrations_api` ledger.

### 4. Seed demo data (optional)

```bash
pnpm seed:api
```

Demo users (password `password123`):

| Email              | Role  |
| ------------------ | ----- |
| `staff@demo.local` | staff |
| `user@demo.local`  | user  |
| `admin@demo.local` | admin |
| `alex@demo.local`  | user  |

Includes sample groups, expenses, and settlements.

### 5. Start the API

```bash
pnpm dev:api
```

Verify:

- Health: [http://localhost:3002/ready](http://localhost:3002/ready)
- Swagger: [http://localhost:3002/docs](http://localhost:3002/docs)

To run the full stack (API + web UI):

```bash
pnpm dev:web    # in a second terminal
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database configuration

The API reads `DATABASE_URL` or builds it from individual vars (`DATABASE_HOST`, `DATABASE_PORT`, etc.).

| Setup                | `DATABASE_PORT` | `DATABASE_NAME` | Notes                       |
| -------------------- | --------------- | --------------- | --------------------------- |
| Docker (`docker:db`) | `5434`          | `app`           | Matches root `.env.example` |
| Local Postgres       | `5432`          | your DB name    | Create the database first   |

Alternatively, set a single connection string:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/app
```

---

## Environment variables

Copy from [`apps/api/.env.example`](./.env.example). Key groups:

### Server

| Variable   | Default       | Description     |
| ---------- | ------------- | --------------- |
| `NODE_ENV` | `development` | Runtime mode    |
| `PORT`     | `3002`        | API listen port |

### Database

| Variable            | Description                      |
| ------------------- | -------------------------------- |
| `DATABASE_URL`      | Full Postgres connection string  |
| `DATABASE_HOST`     | Host (used if no `DATABASE_URL`) |
| `DATABASE_PORT`     | Port (default `5432`)            |
| `DATABASE_USERNAME` | Postgres user                    |
| `DATABASE_PASSWORD` | Postgres password                |
| `DATABASE_NAME`     | Database name                    |

### Auth

| Variable                              | Description                       |
| ------------------------------------- | --------------------------------- |
| `AUTH_JWT_SECRET`                     | JWT signing secret (min 16 chars) |
| `AUTH_JWT_TOKEN_EXPIRES_IN`           | Access token TTL (e.g. `15m`)     |
| `AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN` | Email verification link TTL       |
| `AUTH_FORGOT_TOKEN_EXPIRES_IN`        | Password reset token TTL          |
| `COOKIE_SECURE`                       | `true` in production (HTTPS only) |

### CORS & public URLs

| Variable         | Description                                   |
| ---------------- | --------------------------------------------- |
| `CORS_ORIGIN`    | Web app origin (e.g. `http://localhost:3000`) |
| `APP_PUBLIC_URL` | Public web URL used in email links            |

### Mail (SMTP)

| Variable             | Description                    |
| -------------------- | ------------------------------ |
| `MAIL_HOST`          | SMTP host                      |
| `MAIL_PORT`          | SMTP port (587 for Gmail)      |
| `MAIL_USER`          | SMTP username                  |
| `MAIL_PASSWORD`      | SMTP password / app password   |
| `MAIL_SECURE`        | `true` for port 465            |
| `MAIL_REQUIRE_TLS`   | `true` for STARTTLS (port 587) |
| `MAIL_DEFAULT_EMAIL` | From address                   |
| `MAIL_DEFAULT_NAME`  | From display name              |

### Invites

| Variable                    | Default | Description           |
| --------------------------- | ------- | --------------------- |
| `GROUP_INVITE_EXPIRES_DAYS` | `7`     | Group invite link TTL |

Canonical names (`JWT_SECRET`, `SMTP_*`) and aliases (`AUTH_*`, `MAIL_*`, `DATABASE_*`) are both supported — see `.env.example`.

---

## Scripts

Run from **repo root** unless you are inside `apps/api`.

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `pnpm dev:api`              | Start API in watch mode             |
| `pnpm build:api`            | Production build                    |
| `pnpm start:api`            | Run compiled `dist/main.js`         |
| `pnpm typecheck:api`        | TypeScript check                    |
| `pnpm test:api`             | Unit tests                          |
| `pnpm migration:run:api`    | Apply pending migrations            |
| `pnpm migration:revert:api` | Revert last migration               |
| `pnpm migration:generate`   | Generate migration from entity diff |
| `pnpm seed:api`             | Load demo data                      |
| `pnpm docker:db`            | Start Postgres container            |
| `pnpm docker:down`          | Stop Postgres container             |

From `apps/api` directly:

```bash
pnpm dev
pnpm migration:run
pnpm seed
```

---

## Project structure

```text
apps/api/
├── src/
│   ├── main.ts                 # Bootstrap, CORS, Swagger
│   ├── app.module.ts           # Root module + global guards
│   ├── config/                 # App & database config
│   ├── common/                 # Auth guards, split utilities
│   ├── database/
│   │   ├── data-source.ts      # TypeORM CLI data source
│   │   ├── migrations/         # Schema migrations
│   │   └── seed.ts             # Demo data
│   └── modules/
│       ├── auth/               # Register, login, verify, reset
│       ├── users/              # User lookup
│       ├── mail/               # SMTP + email templates
│       ├── groups/             # Groups, members, invites, friends
│       ├── expenses/           # Expenses + shares
│       ├── balances/           # Computed group balances
│       ├── settlements/        # Record payments between members
│       └── health/             # /, /health, /ready
├── .env.example
├── docs/
│   └── APPLICATION_FLOW.md     # End-to-end sequence diagrams
└── README.md                   # This file
```

---

## API overview

| Area        | Base path                                 | Auth    |
| ----------- | ----------------------------------------- | ------- |
| Auth        | `/auth/*`                                 | Public* |
| Users       | `/users/*`                                | JWT     |
| Groups      | `/groups/*`                               | JWT     |
| Invites     | `/invites/*`                              | Mixed   |
| Friends     | `/friends`                                | JWT     |
| Expenses    | `/groups/:id/expenses/*`                  | JWT     |
| Balances    | `/groups/:id/balances`                    | JWT     |
| Settlements | `/groups/:id/settlements`, `/settlements` | JWT     |
| Health      | `/`, `/health`, `/ready`                  | Public  |

\* Login requires verified email. Most routes require the `access_token` cookie or Bearer JWT.

Interactive docs: **http://localhost:3002/docs** — use **Authorize** after logging in via `POST /auth/login`.

---

## Application flow

For sequence diagrams covering registration → group → expense → balance → settlement, see:

**[docs/APPLICATION_FLOW.md](./docs/APPLICATION_FLOW.md)**

---

## Troubleshooting

### `ECONNREFUSED` on database connect

- Confirm Postgres is running: `pnpm docker:db` or your local service.
- Check `DATABASE_PORT`: Docker uses **5434**, not 5432.
- Ensure `DATABASE_NAME` matches (`app` for Docker Compose).

### Migrations fail or tables missing

```bash
pnpm migration:run:api
```

Migrations use ledger table `migrations_api` (separate from any gateway migrations).

### Login returns 403 "Email not verified"

Complete verification via the link sent to your inbox, or use seeded users (`pnpm seed:api`) which are pre-verified.

### Emails not sending

- Verify SMTP credentials in `apps/api/.env`.
- For Gmail: use an [App Password](https://support.google.com/accounts/answer/185833), port `587`, `MAIL_REQUIRE_TLS=true`.
- Check API logs for Nodemailer errors on register / invite.

### CORS or cookie issues from the web app

- `CORS_ORIGIN` must match the web origin (`http://localhost:3000`).
- Web requests must use `credentials: 'include'` (already configured in `@shared/api-client`).
- In production, set `COOKIE_SECURE=true` and serve over HTTPS.

### Port already in use

Change `PORT` in `apps/api/.env` or stop the process on `:3002`.

---

## Related documentation

- [docs/architecture.md](../../docs/architecture.md) — system overview, invariants, ERD
- [docs/stack.md](../../docs/stack.md) — monorepo commands and tech stack
- [specs/SPEC.md](../../specs/SPEC.md) — product specification
