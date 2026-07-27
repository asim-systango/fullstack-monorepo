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

| Path            | Role                                         |
| --------------- | -------------------------------------------- |
| `apps/web`      | Next.js App Router UI                        |
| `apps/api`      | NestJS API (TypeORM + cookie JWT)            |
| `libs/*`        | Shared packages (`@repo/*`)                  |
| `tools/scripts` | Instructor tooling (brief generator)         |
| `docker/`       | Postgres Compose (`docker-compose.yml` only) |
| `docs/`         | Architecture, ADRs, project briefs           |

## Domain notes

_Describe your ERD and key invariants here (per assigned project)._

## Demo script

1. Register / login
2. …
