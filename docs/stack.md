# Stack rules

Hard rules for every project.

1. **Nest ≠ Next** — domain CRUD in `apps/api` (`@app/api`). Auth cookies on `apps/api-gateway` (`@app/api-gateway`). Next is UI only (`@app/web`).
2. **Cookie JWT** — httpOnly `access_token` from the gateway. Never `localStorage`.
3. **Browser → `/api`** — `NEXT_PUBLIC_API_URL=/api` (Next rewrites to the gateway). Use `withCredentials: true`.
4. **TanStack Query** — server lists and mutations.
5. **Redux Toolkit** — drafts, filters, selection only (not Nest entity arrays).
6. **Migrations only** — `synchronize: false`. Users: gateway. Domain: `apps/api`.
7. **ValidationPipe** — whitelist + forbid non-whitelisted.
8. **UI states** — empty ≠ loading ≠ error.
9. **Envelope** — success is `{ data: T }` via `@shared/http`; prefer `@shared/api-client` on the web.
10. **CORS** — set on the gateway for direct `:3001` tools; the UI path is same-origin via Next.
11. **Package scopes** — keep `@app/*` / `@shared/*` (do not rename to a product brand).
12. **Tailwind CSS (web)** — theme tokens in `apps/web/styles/globals.css` (`@theme` + CSS variables). Prefer semantic utilities (`bg-background`, `text-primary`) and `@shared/ui` components. Do not invent one-off colors.

## Day plan (5–6 days)

| Day | Focus                                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | ERD, Nest modules, gateway auth check, `migration:run` + `seed` (+ `migration:run:api` when domain tables exist) |
| 2   | Domain CRUD, invariants, list + filters                                                                          |
| 3   | Next list / create / detail with Query                                                                           |
| 4   | RTK drafts/filters + roles in UI                                                                                 |
| 5   | Should features + polish                                                                                         |
| 6   | Buffer: Stretch, demo, fill `docs/architecture.md`                                                               |

## Seed users

| Email              | Password      | Role                           |
| ------------------ | ------------- | ------------------------------ |
| `admin@demo.local` | `password123` | admin                          |
| `user@demo.local`  | `password123` | user                           |
| `staff@demo.local` | `password123` | staff (rename for your domain) |
