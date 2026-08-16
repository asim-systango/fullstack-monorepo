<p align="center">
  <img src="apps/web/public/brand/bookly-logo.png" alt="Bookly" width="240" />
</p>

<h1 align="center">Bookly</h1>
<p align="center">
  <strong>Library Management System</strong><br />
  Full-Stack — Backend + Frontend
</p>

Bookly is a full-stack library management system for physical copies, not just titles. It covers catalog and copy management, member accounts, staff-mediated loans, reservations, fines, email notices, and role-based operations for members, librarians, and administrators.

---

## What’s Included

### Backend

- **NestJS** domain API with TypeORM and **PostgreSQL**
- Cookie JWT authentication (login, refresh, OTP signup/reset) and **role-based access control** (`user`, `staff`, `admin`)
- Library modules: books and copies, loans, checkout requests, reservations, fines, members, settings, dashboards
- **Email notices** for circulation events (Nodemailer / SMTP)
- TypeORM **migrations** plus an idempotent **seed** for local evaluation
- Modular controllers/services, class-validator DTOs, `{ data }` response envelope

### Frontend

- **Next.js** (App Router) and **TypeScript**
- Role-based shells, navigation, and route guards for member, librarian, and admin
- Reusable persona components plus shared UI primitives from `@shared/ui`
- Responsive layouts for catalog, desk, and administration screens
- **TanStack Query** for server data; **Redux Toolkit** for short-lived UI workflow state

---

## Seed Data

Load the demo dataset with `pnpm docker:db`, `pnpm migration:run`, and `pnpm seed`.

The demo catalog includes:

| Item         | Count |
| ------------ | ----: |
| Books        |     4 |
| Book copies  |     8 |
| Loans        |     5 |
| Active loans |     3 |
| Reservations |     2 |
| Fines        |     1 |

### Catalog

| Title             | Author                         | ISBN            | Copies |
| ----------------- | ------------------------------ | --------------- | -----: |
| Atomic Habits     | James Clear                    | `9780735211292` |      2 |
| Zero to One       | Peter Thiel with Blake Masters | `9780804139298` |      1 |
| Build, Don't Talk | Raj Shamani                    | `9780143465874` |      2 |
| The Alchemist     | Paulo Coelho                   | `9780062315007` |      3 |

Atomic Habits is fully on loan (both copies), which is why a member can reserve it. Zero to One has a single circulating copy, currently on loan and overdue. The remaining copies are on the shelf.

Two additional member records (`user2@demo.com`, `user3@demo.com`) hold copies so the 3 active loans are spread across accounts.

---

## Demo Credentials

For local evaluation only. Password is reset to `password123` on every seed.

| Role              | Email            | Password      |
| ----------------- | ---------------- | ------------- |
| Admin             | `admin@demo.com` | `password123` |
| Librarian / Staff | `staff@demo.com` | `password123` |
| Member / User     | `user@demo.com`  | `password123` |

Open **http://localhost:3000** after `pnpm dev`.

---

## Roles & Capabilities

Members request and reserve titles. Librarians issue and return physical copies at the desk. Admins manage members, roles, policies, and fines.

### Member / User

- Search and browse the catalog by title, author, or ISBN; filter to available titles
- View book details, description, and available copy count
- Request checkout when a copy is available
- Reserve a title when every copy is on loan
- Cancel a pending checkout request or an active reservation
- See current and previous loans, including overdue highlighting and due-soon filters
- View outstanding and historical fines
- Use the member overview for active loans, reservations, and outstanding fines

### Librarian / Staff

- Create, update, remove, and restore books; register and update copies
- Check out an available copy to a member and process returns at the desk
- Issue or reject member checkout requests
- Work the overdue queue and send overdue reminder emails
- Settle an overdue fine as paid or unpaid at return
- Look up members, loan summaries, and circulation status
- Returning a copy fulfills the oldest reservation and emails that member that the title is ready

### Admin

- Create members (temporary password is emailed; first login requires a password change)
- Change roles, including promoting members to staff
- Suspend and reinstate members
- Configure policies: max active loans, default loan length, and daily fine rate
- Review, mark paid, or waive fines
- Manage the catalog and view system-wide loans

---

## Notifications

Bookly sends **email** notices (Nodemailer / SMTP) for circulation and account events.

| Trigger                                  | Notification              |
| ---------------------------------------- | ------------------------- |
| Book issued / checkout request fulfilled | Issue confirmation        |
| Book returned                            | Return confirmation       |
| Reserved title becomes available         | Your reservation is ready |
| Loan due tomorrow                        | Due-date reminder         |
| Loan overdue                             | Overdue loan notice       |
| Sign up / email verification             | OTP email                 |
| Forgot password                          | Password reset OTP        |

---

## Technical Notes

### Backend

- **NestJS** + **TypeORM** + **PostgreSQL**, with auth and domain modules in `apps/api` (the browser talks to this process through the Next.js `/api` rewrite)
- Feature modules: `auth`, `users`, `books`, `loans`, `checkout-requests`, `reservations`, `fines`, `members`, `settings`, `dashboard`, `mailer`
- DTOs validated with `class-validator` (`whitelist`, `forbidNonWhitelisted`); errors go through a global exception filter and `{ data }` envelope
- JWT cookie + Bearer auth, refresh tokens, `RolesGuard`, and a must-change-password gate for admin-created accounts
- Schema changes via TypeORM migrations (`synchronize: false`); `pnpm seed` upserts demo users and the catalog above
- Circulation writes (checkout, return, reservation create) run in transactions with row locks; copy availability and the active-loan limit are enforced in the service layer

### Frontend

- **Next.js App Router** and **TypeScript**, with routes composed in `apps/web/app`
- Feature UI is split by persona: `components/member`, `components/staff`, `components/admin`
- Shared primitives from `@shared/ui`; Bookly theme tokens for member, staff, and admin shells
- Custom hooks in `lib/bookly` (queries, mutations, cache invalidation) and `lib/auth` (session, `hasRole`, `can*` helpers)
- Forms use local component state with **Zod** schemas (`lib/validation/auth.ts` and `@shared/types`)
- Responsive catalog, desk, and admin layouts; `RequireRole` gates librarian and admin routes
- Cookie session via `AuthProvider`; login, register, OTP, and password-reset flows live under `(auth)`

### Data Fetching & State Management

- **TanStack Query** owns server state: books, loans, reservations, checkout requests, fines, members, settings, and dashboards
- Query keys are centralized; mutations invalidate the related lists, details, and dashboards
- Default `staleTime` is 30 seconds (`retry: 1`, no refetch on window focus). Settings use a 5-minute `staleTime`
- Query deduplicates in-flight reads for the same key and exposes pending/error states used by the pages
- **Redux Toolkit** holds client-only workflow state: desk checkout selection, catalog filter drafts, and pending auth email. Applied catalog filters live in the URL
- **React Context** holds the authenticated user; forms keep ephemeral field state locally

This split keeps server records out of Redux and keeps desk/filter drafts out of the query cache.
