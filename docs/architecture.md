# Architecture

| Layer              | Owns                                        | Does not own                   |
| ------------------ | ------------------------------------------- | ------------------------------ |
| React components   | UI composition, local ephemeral UI          | Server lists, auth tokens      |
| Redux Toolkit      | Drafts, selection, filter chrome            | Nest entity arrays             |
| TanStack Query     | Server reads/writes, cache invalidation     | Unfinished form drafts         |
| Next.js App Router | Routes, layouts, metadata, SC/CC boundaries | Product CRUD APIs              |
| NestJS             | Auth, validation, domain rules, persistence | Browser session storage of JWT |
| PostgreSQL         | Data + constraints + migrations             | —                              |

## Layout

| Path            | Role                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| `apps/web`      | Next.js App Router UI                                                    |
| `apps/api`      | NestJS API (TypeORM + cookie JWT)                                        |
| `libs/*`        | Shared packages (`@repo/*`) — active + unused stubs (see README)         |
| `tools/scripts` | Instructor tooling (brief generator)                                     |
| `docker/`       | Postgres Compose; `Dockerfile.*` stubs exist but are not used by Compose |
| `docs/`         | Architecture, ADRs, project briefs                                       |

## Boilerplate conventions (do not fight these)

- **Success responses** are wrapped as `{ data: T }`. Prefer `@repo/api-client` (it unwraps); raw `fetch` must unwrap yourself.
- **Auth:** `JwtAuthGuard` + `RolesGuard` are global. Mark anonymous routes with `@Public()` — JWT is still attempted so `request.user` is set when a cookie is valid. Protected routes (e.g. `GET /auth/me`) require a cookie.
- **Entities:** name files `*.entity.ts` under `apps/api/src/modules/`, register with `TypeOrmModule.forFeature([...])` (`autoLoadEntities: true`). CLI migrations use the same `*.entity.ts` glob via `data-source.ts`.
- **Env:** API loads the **first existing** file among `apps/api/.env` then repo-root `.env` (no merge). Put API secrets in `apps/api/.env`. Root `.env` is for Compose (`POSTGRES_*`).
- **Swagger** (non-production): `http://localhost:3001/docs`.

## Domain notes

_Describe your ERD and key invariants here (per assigned project)._

## Demo script

1. Register / login
2. …
