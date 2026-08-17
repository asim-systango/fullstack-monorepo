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

### Support Desk Overview

The Support Desk domain (`apps/api`) provides end-to-end customer support ticket lifecycle management, multi-channel threaded messaging (public messages, staff internal notes, and automated system events), agent queue management, priority-based SLA deadline tracking, and audit logging.

- **Detailed Planning Docs:** [docs/support-desk/](./support-desk/)
- **ERD & Schema Details:** [docs/support-desk/ERD.md](./support-desk/ERD.md)
- **Database Design:** [docs/support-desk/DATABASE_DESIGN.md](./support-desk/DATABASE_DESIGN.md)
- **API Specification:** [docs/support-desk/API_CONTRACT.md](./support-desk/API_CONTRACT.md)

### Entities & Relationships

1. **Category** (`categories`): Support domain classifications. Has many `SlaPolicy` rows and `Ticket` rows.
2. **SlaPolicy** (`sla_policies`): SLA response and resolution target hours per priority (`urgent`, `high`, `medium`, `low`) per category.
3. **Ticket** (`tickets`): Core entity with sequential human-friendly ticket numbers (`TICK-10001`), versioning (`version` for OCC), assignee (`assigneeId`), SLA deadlines (`firstResponseDueAt`, `resolutionDueAt`), and soft-delete timestamp (`deletedAt`).
4. **Message** (`messages`): Threaded conversation entries linked to a ticket. Supports public messages (`MessageType.PUBLIC`) and staff internal notes (`MessageType.INTERNAL_NOTE`). Linked to `User` entity (`userId`).
5. **TicketEvent** (`ticket_events`): Immutable audit ledger capturing all ticket state transitions (status change, reassignment, priority update).
6. **Notification** (`notifications`): In-app alerts for users and agents triggered on key ticket lifecycle events.
7. **OutboxEvent** (`outbox_events`): Transactional outbox event ledger ensuring zero-loss async event delivery.

### Status State Machine

| Current Status | Permitted Next Statuses | Action / Trigger                                                                   |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `open`         | `pending`, `resolved`   | Agent assigns or sends first reply (`pending`), or resolves directly (`resolved`). |
| `pending`      | `open`, `resolved`      | Customer replies (`open`), or issue is fixed (`resolved`).                         |
| `resolved`     | `closed`, `open`        | Customer confirms fix (`closed`), or reopens with reply (`open`).                  |
| `closed`       | _(Terminal)_            | Ticket is archived. No further status changes or messages permitted.               |

### Hard Invariants

- **Atomic Creation:** Ticket + first message + outbox event are created atomically inside a single DB transaction in `TicketsService.create()`.
- **State Machine Enforcement:** Status transitions are strictly validated in `TicketsService` and enforced by `CHECK (status IN (...))` DB constraints.
- **Optimistic Concurrency Control:** Updates verify `expectedVersion === ticket.version` to prevent agent race conditions; mismatches throw `409 Conflict`.
- **SLA Deadline Calculation:** SLA target dates (`firstResponseDueAt`, `resolutionDueAt`) are automatically calculated upon creation using the Category x Priority SLA policy matrix.
- **Customer Scope Isolation:** Customers can only query or view their own tickets (`userId === jwt.sub`). Accessing another user's ticket returns `404 Not Found`.
- **Category Safeguards:** Categories with active associated tickets cannot be deleted (`400 Bad Request`).

---

## Demo Script (5 Minutes)

### 1. Roles & Navigation (30s)

- **Customer Flow:** Log in as Customer (`user@example.com` / `password123`). Navigate to `/tickets` to view active customer tickets and open the ticket creation modal.
- **Agent/Staff Flow:** Log out, then log in as Staff/Agent (`staff@example.com` / `password123`). Navigate to `/agent` to access the central Agent Inbox.

### 2. Happy Path Ticket Lifecycle (2m)

- **Step 1 (Create Ticket):** As Customer, create a new ticket ("Unable to process payment") with Category "Billing & Invoicing" and Priority "Urgent". Note sequential number `#TICK-10024`.
- **Step 2 (Assign Agent):** As Agent on `/agent`, open ticket `#TICK-10024`. Click **"Assign to Me"**. Notice the assignee updates dynamically and an audit event (`ASSIGNED`) is appended to the timeline.
- **Step 3 (Reply & Internal Note):** Send a public reply to the customer ("We are investigating your invoice"). Post a staff-only Internal Note ("Checked gateway logs, retrying charge"). Confirm internal note styling is visually distinct.
- **Step 4 (Status Progression):** Update status from `OPEN` → `PENDING` → `RESOLVED` → `CLOSED`. Verify timeline ledger captures every transition.

### 3. Invariants & Guardrails (30s)

- **Invalid Status Jump:** Demonstrate that attempting an invalid status jump (e.g. `OPEN` → `CLOSED` directly) yields a `400 Bad Request` validation error.
- **Access Control:** Demonstrate that logging in as Customer B and attempting to view Customer A's ticket URL (`/tickets/[id]`) returns `404 Not Found`.

### 4. Agent Inbox Filtering & Queue Management (1m)

- **Filter Bar:** On `/agent`, filter tickets by **Status** (`OPEN`), **Priority** (`URGENT`), and **Category** (`Billing & Invoicing`).
- **Search:** Use the live full-text search bar to search for keyword `"invoice"` or `"payment"`.

### 5. Bonus & Enterprise Features (30s)

- **SLA Breach Warning:** View the dynamic **`⚠️ SLA BREACHED`** badge on tickets exceeding their first response target hours.
- **Agent KPI Dashboard:** View live stats (_Total Queue_, _Open Tickets_, _Pending Response_, _SLA Breached_) on `/agent`.
- **In-App Notifications:** Click the bell icon in `ShellHeader` to view real-time unread notifications and mark them as read.
- **Category SLA Matrix Management:** Log in as Admin (`admin@example.com` / `password123`) and navigate to `/admin/categories` to edit SLA policy target hours.
