# Course stack rules

This monorepo uses the same fullstack stack as the teaching course.

## Hard rules

1. **Nest ≠ Next** — product CRUD and auth live in Nest. Next hosts UI (App Router). Do not reimplement domain APIs as Next Route Handlers.
2. **Cookie JWT** — httpOnly cookie (`access_token`). Never put JWT in `localStorage`.
3. **Axios `withCredentials: true`** for browser → Nest.
4. **TanStack Query** owns server lists and mutations (cache + invalidation).
5. **Redux Toolkit** owns unfinished drafts, selection, and filter chrome only — never Nest entity arrays.
6. **TypeORM migrations only** — `synchronize: false` in shipped code.
7. **ValidationPipe** whitelist + forbid non-whitelisted on Nest.
8. **Empty ≠ loading ≠ error** in the UI.

## Suggested day plan (5–6 days)

| Day | Focus                                            |
| --- | ------------------------------------------------ |
| 1   | ERD, Nest modules, auth, first migration + seed  |
| 2   | Domain CRUD, invariants, list pagination/filters |
| 3   | Next shell + Query list/mutations                |
| 4   | RTK drafts/filters + role-aware UI               |
| 5   | Should-tier features + Compose polish            |
| 6   | Buffer: Stretch or demo + `docs/architecture.md` |

## Seed credentials (boilerplate)

| Email                   | Password      | Role                           |
| ----------------------- | ------------- | ------------------------------ |
| `admin@fullstack.local` | `password123` | admin                          |
| `user@fullstack.local`  | `password123` | user                           |
| `staff@fullstack.local` | `password123` | staff (rename for your domain) |
