# Implementation Plan: Splitter App (Expense Split)

## Overview

Build the Splitter expense-sharing application as a vertical-slice implementation: all backend work in `apps/api` (auth, SMTP mail, groups, expenses, balances, settlements), frontend in `apps/web` (Next.js 15 + TanStack Query + RTK), PostgreSQL via TypeORM migrations. Do **not** modify `apps/api-gateway`. Must-tier scope covers register/verify/login, forgot/reset password, group creation, email invites, expenses with share-sum invariant, computed balances, settlements, soft-delete audit, platform admin read access, and platform admin group block/unblock (only platform write).

Spec: [`../SPEC.md`](../SPEC.md)

## Architecture Decisions

- **Single backend app (`apps/api`)** — auth, users, mail, and all Splitter domain modules live here; gateway is untouched.
- **SMTP via `MailModule`** — Nodemailer; all transactional email (verify, reset, invite) goes through `MailService`; tokens hashed at rest.
- **Computed balances** — no ledger table; `BalancesService` derives nets from non-deleted expenses minus settlements.
- **Vertical slices** — each task delivers a testable path (API + UI where applicable), not horizontal "all DB then all API" layers.
- **Frontend → `apps/api` directly** — update `apps/web` Next rewrite to `:3002` (web-only change); cookie/JWT auth handled in `apps/api` with CORS + credentials.
- **Money in integer cents** — share-sum invariant enforced in service + DB CHECK constraints; largest-remainder for equal splits.
- **TanStack Query for server state; RTK for filter/draft chrome only** — per stack rules.
- **Platform admin writes** — block/unblock group only (`groups.blocked_at`); all other platform access is read-only.
- **Member removal** — in-group admin only; not platform admin; no balance-based removal block.
- **Pagination** — expense list default `limit=10`.
- **Blocked groups** — members retain read-only access to expenses, balances, and settlements; mutations return 403.
- **Migration 1 includes schema review additions** — `created_by_user_id`, `responded_at`, `blocked_at`/`blocked_by_user_id`, FK constraints, composite indexes.

## Dependency Graph

```text
Task 1 (env + MailModule)
    └── Task 2 (Migration 1)
            ├── Task 3 (Auth backend)
            │       ├── Task 4 (Web API routing + auth client)
            │       │       └── Task 5 (Auth frontend)
            │       └── Task 6 (Domain seed)
            ├── Task 7 (Groups backend)
            │       └── Task 8 (Invites backend)
            │               ├── Task 9 (Groups frontend)
            │               └── Task 10 (Invites frontend)
            ├── Task 11 (Expenses backend)
            │       └── Task 12 (Expenses frontend)
            ├── Task 13 (Balances backend)
            ├── Task 14 (Settlements backend)
            │       └── Task 15 (Balances + settle frontend)
            ├── Task 16 (Admin edit + audit UI)
            └── Task 17 (Route protection + role UI)
Task 18 (Shared types + architecture docs) — after Task 15, can parallel with 16–17
```

## Task Index

Compact index only. Full acceptance criteria, verification, and file lists are in [`todo.md`](todo.md).

### Phase 1: Foundation (Tasks 1–2)

- [x] Task 1: API env, SMTP config, and MailModule foundation
- [x] Task 2: Migration 1 — all Must-tier tables, FKs, and indexes

### Checkpoint: Foundation

- [x] `pnpm migration:run:api` succeeds on clean DB
- [x] `pnpm build:api` and `pnpm typecheck:api` pass
- [ ] MailModule sends a test message to Mailpit (manual)

### Phase 2: Auth vertical slice (Tasks 3–6)

- [x] Task 3: Auth backend — User entity, tokens, register/login/logout/verify/resend/forgot/reset
- [x] Task 4: Web API routing to `apps/api` and auth API client extensions
- [x] Task 5: Auth frontend — verify, forgot, reset pages + register/login UX
- [x] Task 6: Domain seed script (`pnpm seed:api`) with pre-verified demo users

### Checkpoint: Auth E2E

- [ ] Register → verification email → verify → login works
- [ ] Forgot password → reset email → new password → login works
- [ ] `pnpm seed:api` populates demo users; demo login succeeds
- [ ] Human review before domain features

### Phase 3: Groups & invites (Tasks 7–10)

- [x] Task 7: Groups backend — create, list, detail, membership, platform admin access
- [x] Task 8: Group invites backend — SMTP invite, accept/decline, lookup, `/invites/me`
- [x] Task 9: Groups frontend — `/groups` list and create-group flow (staff)
- [x] Task 10: Invites frontend — invite form and `/invites/accept` page

### Checkpoint: Groups E2E

- [ ] Staff creates group → admin sends invite email → invitee accepts → member appears
- [ ] Non-member gets 403 on group detail
- [ ] Platform admin can list/view any group and block/unblock a group

### Phase 4: Expenses (Tasks 11–12)

- [x] Task 11: Expenses backend — create, list/filter, get, admin PATCH, soft-delete, audit
- [x] Task 12: Expenses frontend — group detail expense list, filters, add-expense split editor

### Checkpoint: Expenses

- [ ] Create expense with valid shares; 400 on sum mismatch
- [ ] Filter by date range and payer works
- [ ] Admin soft-delete hides from list; audit endpoint returns deleted row

### Phase 5: Balances & settlements (Tasks 13–15)

- [x] Task 13: Balances backend — net computation and simplified debts endpoint
- [x] Task 14: Settlements backend — create with debt cap, list history
- [x] Task 15: Balances frontend — `/groups/[id]/balances` and settle-up dialog

### Checkpoint: Core Splitter E2E

- [ ] Full flow: expense → balances → settlement → balances update to all-clear
- [ ] Settlement exceeding debt returns 400
- [ ] `$100 / 3` split totals exactly 10000 cents

### Phase 6: Admin polish & docs (Tasks 16–18)

- [x] Task 16: Admin expense edit UI and deleted-expenses audit view
- [x] Task 17: Route protection, email-verified gate, and role-based UI
- [x] Task 18: Shared Zod types, `docs/architecture.md`, and demo script

### Checkpoint: Complete

- [ ] All Must success criteria in SPEC.md satisfied
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm lint` pass
- [x] 5-minute demo script ready for PR
- [ ] Human review before Should-tier features

## Parallelization Opportunities

| Can run in parallel (after deps met)     | Must stay sequential          |
| ---------------------------------------- | ----------------------------- |
| Task 4 + Task 6 (after Task 3)           | Task 2 before any entity work |
| Task 9 + Task 11 (after Task 8 / Task 7) | Migrations before seed        |
| Task 18 (types/docs) with Task 16–17     | Auth before groups            |
|                                          | Expenses before balances      |

## Risks and Mitigations

| Risk                                               | Impact                             | Mitigation                                                                     |
| -------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| Web still proxies to gateway instead of `apps/api` | High — auth/domain calls fail      | Task 4 explicitly updates `apps/web` rewrite only; smoke-test `/auth/me`       |
| SMTP misconfigured in dev                          | Med — blocks register/invite demos | Document Mailpit; seed pre-verified users; Task 1 verification sends test mail |
| Share-sum rounding bugs ($100÷3)                   | High — invariant failure           | Implement largest-remainder in shared util; test in Task 11                    |
| Platform admin vs group admin confusion            | Med — wrong 403/200                | Document guard rules in services; Task 7 + 17                                  |
| Scope creep into Should-tier                       | Med — delays Must                  | Defer recurring, reports, dashboard to post-Task 18                            |
| `apps/api-gateway` accidental edits                | Low                                | Boundary in every task: do not touch gateway                                   |

## Resolved decisions (from SPEC)

| Topic                 | Decision                                                         |
| --------------------- | ---------------------------------------------------------------- |
| Remove member         | In-group admin only — not platform admin; no balance-based block |
| Pagination            | 10 items per page (Task 11)                                      |
| Platform admin writes | Block/unblock group only (Task 7, 17)                            |
| Blocked group access  | Members read expenses/balances/settlements; mutations → 403      |

## Open Questions (from SPEC — resolve during build)

1. **Frontend API routing** — default: Next rewrite to `http://localhost:3002` in Task 4.
2. **Should-tier priority** — defer until after Task 18.
