# Architecture

Splitter is an expense-sharing app (groups, invites, expenses, computed balances, settlements). Auth, mail, and domain APIs all live in **`apps/api`**. Do **not** treat the gateway as the Splitter backend.

## Request flow

```text
Browser → web :3000
            /api/*  (Next rewrite → apps/api :3002)
              ↓
         api :3002       auth, mail, groups, expenses, balances, settlements
              ↓
         Postgres
```

Local UI talks to `apps/api` with cookie JWT (`access_token`) and `credentials: true`. `apps/api-gateway` is unused for this product.

## Who owns what

| Layer          | Owns                                             | Does not own       |
| -------------- | ------------------------------------------------ | ------------------ |
| Next UI        | Pages, layout, forms, role-gated chrome          | Product CRUD APIs  |
| TanStack Query | Groups, expenses, balances, settlements, invites | Filter drafts      |
| Redux Toolkit  | Expense list filter drafts                       | Nest entity arrays |
| Domain API     | Auth cookies, SMTP, entities, invariants         | Next pages         |
| Postgres       | Data + constraints                               | —                  |

## Folders

| Path               | Role                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| `apps/web`         | Next UI (`:3000`) — `@app/web`                                                         |
| `apps/api-gateway` | Out of scope for Splitter — do not modify                                              |
| `apps/api`         | Auth + Splitter Nest API (`:3002`) — `@app/api`                                        |
| `libs/ui`          | Shared UI kit + theme — `@shared/ui/components`                                        |
| `libs/*`           | Shared packages (`@shared/types`, `@shared/api-client`, `@shared/env`, `@shared/http`) |

## Conventions

- Responses: `{ data: T }` — `@shared/http` envelope
- Errors: `{ statusCode, error, message, details? }`
- Browser auth: httpOnly `access_token` cookie from `apps/api`
- Money: integer cents; share amounts must sum to `amountCents`
- Balances: computed (no ledger table) from non-deleted expenses minus settlements
- Blocked groups: members retain read access; mutations return 403

## Domain notes

### ERD (Must tables)

```text
users
  ├── email_verification_tokens
  ├── password_reset_tokens
  ├── groups (created_by, blocked_at, blocked_by)
  │     ├── group_members (role: admin | member)
  │     ├── group_invitations (hashed token, pending unique per email)
  │     ├── expenses (soft-delete + deleted_by)
  │     │     └── shares (user_id, amount_cents)
  │     └── settlements (payer, payee, created_by)
```

### Invariants

- Share sum = expense `amountCents` or the API returns **400** `Share amounts must equal expense total`.
- Equal splits use largest remainder (`$100 / 3` → `3334, 3333, 3333` cents).
- Settlement amount cannot exceed outstanding pairwise capacity (debtor net vs creditor net) — **400** `Settlement exceeds outstanding balance`.
- Group mutations (expense, invite, settlement, remove member) require membership and fail with **403** when `blocked_at` is set.
- Remove member and expense edit/delete: **in-group admin only** (platform `admin` is read-only except block/unblock).
- Invite tokens are stored as SHA-256 hashes; raw token only appears in the email link.

### Auth & mail

- Register creates an unverified user and sends SMTP verification (`APP_PUBLIC_URL/verify-email?token=`).
- Login returns **403** until `email_verified_at` is set.
- Forgot password always returns 200; reset uses a hashed, single-use token.
- Group invites: `POST /groups/:id/invites` → SMTP → `/invites/accept?token=`.

## Demo script

Demo users (after `pnpm seed:api`): `staff@demo.local`, `user@demo.local`, `admin@demo.local` / `password123`. Staff is group admin of **Goa Trip 2025** and **Shared Apartment**.

1. **Roles** — Log in as staff: create-group is visible. Log in as user: create-group is hidden; open a seeded group as a member. Log in as platform admin: all groups listed, block/unblock on detail, no invite/edit/remove.
2. **Happy path** — Staff: create a group → invite `alex@demo.local` (or a new email) → accept from `/invites/accept?token=` → add an expense with **Split equally** → open Balances → **Settle** a suggested debt → nets update without reload.
3. **Share invariant 4xx** — Add expense `$10.00` but set shares that do not sum to `1000` cents: submit stays disabled in the UI; forcing the API returns **400**.
4. **Filters** — On group detail, filter expenses by date range and payer; Apply/Clear uses the RTK filter draft and refetches via TanStack Query.
5. **Audit** — Group admin: delete an expense (confirm dialog) → it leaves the main list → **Show deleted** lists it with a Deleted badge. Opening `/groups/{id}/expenses/{deletedId}` shows “no longer available”.
