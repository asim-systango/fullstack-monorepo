# Architecture

Bookly is a staff-mediated library system. Members browse and request; librarians issue and return physical copies at the desk.

## Request flow

```text
Browser → web :3000
            /api/*  (Next rewrite)
              ↓
         gateway :3001   cookie JWT, /auth/*  (optional hop)
              ↓
         api :3002       domain modules
              ↓
         Postgres
```

```text
URL applied filters  →  TanStack Query  →  libs/api-client  →  API
RTK catalog drafts   →  Apply writes URL
RTK checkoutSelection / authUi  →  pages / pickers
```

## Who owns what

| Layer | Owns | Does not own |
| --- | --- | --- |
| `apps/web/app` | Routes and page composition | Axios, entity caches |
| `components/{member,staff,admin}` | Persona UI | Fetch/axios, duplicated chrome |
| `@shared/ui` | Page, PageHeader, EmptyState, Table, Dialog, Badge, MetricCard | Domain workflows |
| `lib/bookly` | TanStack Query server state | Redux entities |
| `lib/store` | IDs and filter drafts (RTK) | `books[]` / `loans[]` |
| URL | Applied list filters | Form drafts |
| `lib/auth` | Cookie session, `hasRole`, `can*` UX helpers | Backend authority |
| `apps/api` modules | Domain rules, transactions, constraints | Browser cookies |

## Folders

```text
apps/web/
├── app/                  routing + composition (URLs unchanged)
├── components/
│   ├── member/           member-specific UI
│   ├── staff/            staff-specific UI
│   ├── admin/            admin-specific UI
│   ├── auth/
│   └── dashboard/
├── lib/
│   ├── bookly/           Query hooks, mutations, invalidation
│   ├── store/            RTK client workflow only
│   │   └── slices/
│   ├── auth/             session + can* helpers
│   └── ...
└── styles/               Bookly tokens + member/staff/admin themes

libs/ui                   shared primitives
libs/api-client           one Axios client
libs/shared-types         Zod contracts
```

Starter stubs `libs/database` and `libs/utils` are unused by Bookly.

## Query vs RTK vs URL vs form

- **TanStack Query** holds server lists and mutations (`useBooks`, `useOverdueLoans`, `useBookActions`). Default `staleTime` is 30s; settings use 5 minutes. Devtools are development-only.
- **RTK** holds `checkoutSelection` `{ memberId, bookId, copyId }`, catalog filter **drafts**, and `authUi.pendingEmail`. Logout calls `resetClientStores()`. There is no global UI slice.
- **URL** owns applied member catalog filters (`/books?q=&author=&isbn=&availableOnly=true&page=`) and staff list params (`useStaffListParams`).
- **Forms** keep local field state plus Zod (`lib/validation/auth.ts`, `@shared/types` `CreateUserInput` / `UpdateRoleInput`).

## ERD (logical)

```text
book 1──* book_copy 1──* loan *──1 member_profile (by user_id, no FK)
book 1──* reservation
book 1──* checkout_request
loan 1──0..1 fine
app_setting (key/value policies)
```

## Invariants

- Loan status is **derived** (`returned_at`, `due_date`), never stored.
- One active loan per copy (`uq_loan_active_copy`).
- One active loan per member+title (`uq_loan_active_user_title`).
- One fine per loan; one active reservation per member+title; one pending checkout request per member+title.
- Barcode unique. ISBN uniqueness unchanged.
- FIFO reservation promotion is **notify, not hold**: the copy returns to `available`; the oldest reservation is marked `fulfilled` and emailed.
- Responses use `{ data }` envelope. JWT `my/*` routes are owner-scoped.

## Transaction boundaries

Checkout lock order is frozen: **copy → member_profile → open loans**. `checkoutInTransaction` is the only issuance primitive (direct checkout and request issue). Same-title is re-checked after the open-loan lock; unique `23505` maps to 409.

Return runs in one transaction (loan row, copy, fine settlement, FIFO notify). Reservation `create` runs availability + active-loan + insert in one transaction with row locks. Do not split `LoansService`.

## RBAC

| Action | Roles |
| --- | --- |
| Public catalog `GET /books`, `GET /books/:id` | Anonymous |
| Member request/reserve, `GET /my/*` | `user` |
| Desk checkout, issue, return, lookup | `staff` only |
| View librarian routes, overdue, catalog management | `staff` + `admin` |
| Users, roles, policies | `admin` |

Frontend `canCheckout` / `canReturn` wrap `hasRole(['staff'])` for UX only. Admin may **view** desk screens; they cannot issue.

## Contracts

- **Public books:** list/detail omit viewer-specific actions.
- **`GET /my/books/:id/actions`:** additive member DTO (`ownLoan`, `ownReservation`, `pendingRequest`, `atBorrowLimit`, CTA flags). Guests skip the query.
- **`GET /loans/overdue`:** members, `q`, `due_date ASC`, accrual, `daysLate` / fine fields.
- **Issue:** staff-only; uses `checkoutInTransaction`.

## Public catalog

`/books` and `/books/[id]` are guest-browsable (search, filter, availability). Reserve / request checkout require login. Authenticated users keep `DashboardShell`. This is the only intentional guest-facing product change. `/librarian/books` is unchanged.

## 5-minute seed demo

1. `pnpm docker:db` then `pnpm migration:run` and `pnpm seed` (see root README).
2. Log in as seeded member → Overview, Browse Books, request checkout (limit comes from `app_setting`, default 2).
3. Log in as staff → Checkout Requests / Checkout Book / Return Book / Overdue.
4. Log in as admin → Policies, members, librarians. Admin can open librarian routes but cannot issue a copy.
5. Guest (logged out) → `/books` catalog without a session.

## Intentional decisions

- Staff-mediated checkout; members request, they do not self-issue.
- Admin is not a desk issuer.
- Default max active loans is 2 (`app_setting`).
- Public catalog for guests; logged-in journeys otherwise unchanged.
- Fulfill reservation = notify, not a shelf hold.
- Persona CSS (`member.css` / `staff.css` / `admin.css`) is not merged.
- `/ui` kit gallery is development-only. Production `app/ui/layout.tsx` calls `notFound()`; `app/not-found.tsx` is the App Router 404.
