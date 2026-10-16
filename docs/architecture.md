# Architecture

Fill in **Domain notes** and **Demo script** for your project before the PR.

## Request flow

```text
Browser → web :3000
            /api/*  (Next rewrite)
              ↓
         gateway :3001   cookie JWT, /auth/*
              ↓
         api :3002       your domain modules
              ↓
         Postgres :5434
```

## Who owns what

| Layer          | Owns                        | Does not own       |
| -------------- | --------------------------- | ------------------ |
| Next UI        | Pages, layout, forms        | Product CRUD APIs  |
| TanStack Query | Server lists and mutations  | Form drafts        |
| Redux Toolkit  | Drafts, filters, selection  | Nest entity arrays |
| API gateway    | Login cookies, CORS, proxy  | Domain tables      |
| Domain API     | Entities, rules, migrations | Browser cookies    |
| Postgres       | Data + constraints          | —                  |

## Folders

| Path               | Role                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| `apps/web`         | Next UI (`:3000`) — `@app/web`                                                        |
| `apps/api-gateway` | Auth + BFF (`:3001`) — `@app/api-gateway`                                             |
| `apps/api`         | Domain Nest API (`:3002`) — `@app/api` (**your Must work**)                           |
| `libs/ui`          | Shared UI kit + theme — prefer `@shared/ui/components` ([frontend.md](./frontend.md)) |
| `libs/*`           | Other shared packages (`@shared/*`) — folder subpaths when folders exist              |
| `docker/`          | Compose: Postgres only · deploy stubs: `Dockerfile.{gateway,api,web}`                 |
| `docs/projects/`   | Capstone briefs                                                                       |

Optional Stretch microservice: [adding-a-service.md](./adding-a-service.md).

## Conventions

- Responses: `{ data: T }` — `@shared/http` envelope (`@shared/http/filters`, `@shared/http/interceptors`) + `@shared/api-client`
- Errors: `{ statusCode, error, message, details? }` via shared `AllExceptionsFilter`
- Browser auth: httpOnly cookie from the gateway (`@Public()` for anonymous routes)
- Domain API auth: Bearer JWT (gateway forwards the cookie as `Authorization`)
- Shared auth: `@shared/http/auth` (`JwtAuthGuard`, `RolesGuard`, `@Public` / `@Roles`) — apps re-export via `common/auth`
- Cookie→Bearer hop: `apps/api-gateway/src/common/proxy-hop.ts` (unit-tested)
- OpenAPI: `/docs` on gateway (cookie) and domain API (Bearer) via `@shared/http/swagger` — local/dev only
- UI: `@shared/ui/components` + `@shared/ui/theme.css` — [frontend.md](./frontend.md); gallery at `/ui`
- Imports: prefer folder subpaths (`@shared/pkg/folder`); Nest apps use folder `index.ts` barrels (`./config`, `./common/auth`, `./modules/auth`); flat packages stay on the package root until a folder exists
- Entities: `*.entity.ts` under `apps/api/src/modules/`
- Users migration/seed: gateway · domain migrations: `apps/api`
- Smoke: `pnpm doctor` (per-hop) or `http://localhost:3000/api/ready`
- Scripts: see root [README](../README.md) (`pnpm dev`, `pnpm doctor`, `pnpm dev:api`, …)

## Domain notes

**Resume Builder** (`kishan-kantariya/resume-builder`)

### ERD

- `Template` (name, key, isActive) — seeded Classic / Modern / Compact; admin toggles active
- `Resume` (ownerId → gateway user UUID, title, templateId, contact fields, summary, status, slug, deletedAt)
- `Section` (resumeId, type, title, position ≥ 0) — CASCADE delete with resume
- `SectionItem` (sectionId, heading, subheading, dates, description, position ≥ 0) — CASCADE with section

### Roles

| Domain    | Gateway | Screens                              |
| --------- | ------- | ------------------------------------ |
| Candidate | `user`  | `/resumes`, editor                   |
| Admin     | `admin` | `/admin/templates`, `/admin/resumes` |
| Coach     | `staff` | Should — not implemented             |

### Invariants / transactions

- **Publish:** requires `fullName`, `email`, and ≥1 item in an Experience or Education section; unique slug from full name (`asha-sharma`, then `-2`, …)
- **Duplicate:** one DB transaction copies resume + all sections + items as a draft titled `"… (copy)"`
- **Save (PUT):** replaces sections/items inside a transaction
- Soft-delete on resumes; public `GET /public/resumes/:slug` only for published, non-deleted

### FE ownership

- TanStack Query: lists, detail, mutations
- RTK `resumeDraft`: editor form + live preview (same draft)
- Templates are React components keyed by `Template.key`

### Seeds

- Gateway: `pnpm seed` (admin/user/staff@demo.local / `password123`)
- Domain: `pnpm seed:api` after `pnpm migration:run:api` (3 templates + 3 resumes with sections/items)

## Demo script

1. **Roles (30s):** Log in as `user@demo.local` → `/resumes`. Log in as `admin@demo.local` → `/admin/templates`. Candidate hitting `/admin/templates` sees Access denied.
2. **Happy path (2m):** New resume → fill contact + Experience items → preview updates live → reorder with Move up/down → switch template → Save → Publish → open `/r/<slug>` logged out.
3. **Invariant (30s):** Publish empty draft → Alert lists missing fields (400).
4. **Lists (1m):** Filter by status/template/q; Duplicate; soft-delete disappears from list.
