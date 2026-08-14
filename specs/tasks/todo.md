# Task List: Splitter App (Expense Split)

Detailed tasks for the plan in [`plan.md`](plan.md). Build one task at a time, top to bottom.

Spec: [`../SPEC.md`](../SPEC.md)

---

## Task 1: API env, SMTP config, and MailModule foundation ✅

**Description:** Extend `apps/api` environment validation with SMTP and `APP_PUBLIC_URL` variables, add `nodemailer` dependency, and implement a `MailModule` with `MailService` that exposes `sendVerificationEmail`, `sendPasswordResetEmail`, and `sendGroupInviteEmail` methods using HTML/text templates. Enable CORS on `apps/api` for `http://localhost:3000` with credentials. Update `apps/api/.env.example` with all SMTP vars. Do not modify `apps/api-gateway`.

**Acceptance criteria:**

- [x] `@shared/env/api` (or `apps/api` validation schema) validates `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `APP_PUBLIC_URL`, and token TTL env vars
- [x] `MailModule` registered and injectable; controllers do not import Nodemailer directly
- [x] Three template methods build correct links using `APP_PUBLIC_URL`
- [x] CORS enabled on `apps/api` for web origin with credentials
- [x] `apps/api/.env.example` documents all SMTP and mail-related variables

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `MailService.sendVerificationEmail`, `MailService.sendPasswordResetEmail`, `MailService.sendGroupInviteEmail`, env validation rejects missing SMTP_HOST
- Edge cases: SMTP connection failure propagates as service error; missing APP_PUBLIC_URL rejected at startup
- Test type: unit
- Suggested file: `apps/api/src/modules/mail/mail.service.spec.ts`

**Verification:**

- [x] Build succeeds: `pnpm build:api`
- [x] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: start API with Mailpit on port 1025; trigger a dev-only mail send or bootstrap log confirming transport connects

**Dependencies:** None

**Files likely touched:**

- `apps/api/package.json`
- `apps/api/.env.example`
- `apps/api/src/config/validation.schema.ts`
- `libs/env/src/api/` (if extending shared env)
- `apps/api/src/modules/mail/mail.module.ts`
- `apps/api/src/modules/mail/mail.service.ts`
- `apps/api/src/modules/mail/templates/`
- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** None

---

## Task 2: Migration 1 — all Must-tier tables, FKs, and indexes ✅

**Description:** Create TypeORM entities and Migration 1 for all Must-tier tables per SPEC schema review: `users`, `email_verification_tokens`, `password_reset_tokens`, `groups`, `group_members`, `group_invitations`, `expenses`, `shares`, `settlements`. Include `created_by_user_id`, `responded_at`, all FK constraints, CHECK constraints, partial unique indexes, and composite expense list index. No Should-tier `recurring_rules` table yet.

**Acceptance criteria:**

- [x] Migration creates all 9 Must tables with columns matching SPEC.md (including `groups.blocked_at`, `groups.blocked_by_user_id`)
- [x] FK constraints on all `*_user_id` columns; RESTRICT on financial tables, CASCADE on token tables
- [x] Partial unique on `(group_id, invitee_email) WHERE status = 'pending'`
- [x] Composite index `idx_expenses_group_active_date` on `(group_id, expense_date DESC) WHERE deleted_at IS NULL`
- [x] `pnpm migration:run:api` succeeds on empty Postgres

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: migration up/down (smoke), entity metadata matches table names
- Edge cases: migration is idempotent on re-run guard (migrations table)
- Test type: unit
- Suggested file: `apps/api/src/database/migrations/` (manual migration verify script)

**Verification:**

- [x] Build succeeds: `pnpm build:api`
- [x] Static / compile checks pass: `pnpm typecheck:api`
- [x] Manual check: run `pnpm docker:db && pnpm migration:run:api`; inspect tables in psql

**Dependencies:** Task 1

**Files likely touched:**

- `apps/api/src/database/migrations/`
- `apps/api/src/modules/users/user.entity.ts`
- `apps/api/src/modules/auth/*.entity.ts`
- `apps/api/src/modules/groups/*.entity.ts`
- `apps/api/src/modules/expenses/*.entity.ts`
- `apps/api/src/modules/settlements/settlement.entity.ts`

**Estimated scope:** Large: 5-8 files

**Domain skill:** None

---

## Checkpoint: Foundation

- [x] Build passes: `pnpm build:api`
- [x] Migration applies cleanly: `pnpm migration:run:api`
- [ ] MailModule transport verified with Mailpit

---

## Task 3: Auth backend — User entity, tokens, register/login/logout/verify/resend/forgot/reset ✅

**Description:** Implement full auth in `apps/api`: `UsersModule`, bcrypt password hashing, JWT issuance (httpOnly cookie or Bearer per existing scaffold), and all auth endpoints from SPEC. Register creates unverified user + verification token + sends email. Login blocks unverified users (403). Verify, resend, forgot (always 200), and reset password flows use hashed single-use tokens. Wire `MailModule` into auth service.

**Acceptance criteria:**

- [x] `POST /auth/register` creates user, sends verification email, returns 201
- [x] `POST /auth/verify-email` marks `email_verified_at`, invalidates token
- [x] `POST /auth/resend-verification` resends for unverified email only
- [x] `POST /auth/login` returns JWT; 403 if email unverified
- [x] `POST /auth/forgot-password` always 200; sends reset email when user exists
- [x] `POST /auth/reset-password` updates password; invalid/expired token → 400
- [x] `GET /auth/me` returns user with `emailVerified` flag
- [x] Tokens stored as SHA-256 hash; raw token never in API response

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `AuthService.register`, `AuthService.login`, `AuthService.verifyEmail`, `AuthService.forgotPassword`, `AuthService.resetPassword`, token expiry, token reuse rejection
- Edge cases: duplicate register email → 409; forgot password unknown email → 200; expired verification token → 400
- Test type: unit
- Suggested file: `apps/api/src/modules/auth/auth.service.spec.ts`

**Verification:**

- [x] Build succeeds: `pnpm build:api`
- [x] Static / compile checks pass: `pnpm typecheck:api`
- [x] Manual check: curl/Swagger register → verify → login; forgot → reset flow via Mailpit links

**Dependencies:** Task 2

**Files likely touched:**

- `apps/api/src/modules/users/`
- `apps/api/src/modules/auth/`
- `apps/api/src/app.module.ts`

**Estimated scope:** Large: 5-8 files

**Domain skill:** `security-and-hardening`, `api-and-interface-design`

---

## Task 4: Web API routing to `apps/api` and auth API client extensions ✅

**Description:** Point `apps/web` Next.js rewrite to `apps/api` (`:3002`) instead of gateway — web-only change. Extend `@shared/api-client` and `apps/web/lib/api.ts` with verify, resend, forgot, reset auth methods. Add Zod schemas to `@shared/types` for auth payloads. Update `apps/web/.env.local.example` with `API_URL=http://localhost:3002` or equivalent rewrite target.

**Acceptance criteria:**

- [x] Browser `/api/*` requests reach `apps/api` on port 3002 (not gateway)
- [x] `authApi` exposes verify, resendVerification, forgotPassword, resetPassword
- [x] Existing login/register/logout/me continue to work against `apps/api`
- [x] No files modified under `apps/api-gateway/`

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `createAuthApi` new methods parse envelope correctly, `resolveApiBaseUrl` returns expected base
- Edge cases: API error body parsed to `ApiClientError`; 403 on unverified login surfaces message
- Test type: unit
- Suggested file: `libs/api-client/src/index.spec.ts`, `apps/web/lib/api-base-url.spec.ts`

**Verification:**

- [x] Build succeeds: `pnpm build:web`
- [x] Static / compile checks pass: `pnpm typecheck:web`
- [x] Manual check: web app login/register hits `:3002` (network tab or API log)

**Dependencies:** Task 3

**Files likely touched:**

- `apps/web/next.config.ts`
- `apps/web/.env.local.example`
- `apps/web/lib/api.ts`
- `libs/api-client/src/index.ts`
- `libs/shared-types/src/index.ts`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `api-and-interface-design`

---

## Task 5: Auth frontend — verify, forgot, reset pages + register/login UX

**Description:** Add Next.js pages `/verify-email`, `/forgot-password`, `/reset-password` using `@shared/ui/components`. Update register page with post-submit "check your email" state. Add forgot-password link on login. Handle `?token=` query params and show success/error via `Alert`. Update `AuthProvider` to expose `emailVerified` from `/auth/me`.

**Acceptance criteria:**

- [ ] `/verify-email?token=` calls API and shows success or error Alert
- [ ] `/forgot-password` submits email and shows generic success message
- [ ] `/reset-password?token=` validates password match and submits new password
- [ ] Register page shows verification pending UX after successful register
- [ ] Login page links to forgot password; shows resend hint on 403 unverified error

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: token extraction from URL, form validation before submit
- Edge cases: missing token shows friendly error; password mismatch blocked client-side
- Test type: component
- Suggested file: `apps/web/app/(auth)/verify-email/page.spec.tsx` (if added)

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: full register → Mailpit link → verify → login in browser

**Dependencies:** Task 4

**Files likely touched:**

- `apps/web/app/(auth)/verify-email/page.tsx`
- `apps/web/app/(auth)/forgot-password/page.tsx`
- `apps/web/app/(auth)/reset-password/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/components/auth/auth-provider.tsx`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `frontend-ui-engineering`, `security-and-hardening`

---

## Task 6: Domain seed script (`pnpm seed:api`) with pre-verified demo users

**Description:** Implement `apps/api/src/database/seed.ts` and wire `pnpm seed:api` in root and `apps/api` package.json. Seed three demo users (admin, user, staff @demo.local / password123) with `email_verified_at` set. Seed 2 groups, 5 members, 6 expenses with shares, 2 settlements using hard-coded UUIDs per SPEC.

**Acceptance criteria:**

- [ ] `pnpm seed:api` runs idempotently (skip or upsert existing rows)
- [ ] Demo users: `admin@demo.local`, `user@demo.local`, `staff@demo.local` — all pre-verified
- [ ] `staff@demo.local` is group admin in 2 groups; `user@demo.local` is member
- [ ] ≥6 expenses with shares and 2 settlements seeded
- [ ] Seed documented in SPEC commands (already present)

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: seed idempotency helper, share sums equal expense amounts in seed data
- Edge cases: re-run seed does not duplicate users or groups
- Test type: unit
- Suggested file: `apps/api/src/database/seed.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:api`
- [ ] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: `pnpm migration:run:api && pnpm seed:api`; login as staff@demo.local succeeds

**Dependencies:** Task 3

**Files likely touched:**

- `apps/api/src/database/seed.ts`
- `apps/api/package.json`
- `package.json` (root seed:api script if missing)

**Estimated scope:** Medium: 3-5 files

**Domain skill:** None

---

## Checkpoint: Auth E2E

- [ ] Register → verify email → login works in browser
- [ ] Forgot → reset → login works
- [ ] `pnpm seed:api` + demo login works
- [ ] Human review before proceeding to domain features

---

## Task 7: Groups backend — create, list, detail, membership, platform admin access

**Description:** Implement `GroupsModule` with create (staff only), list (member groups; platform admin sees all), get detail with members, remove member (in-group admin only — not platform admin), and platform-admin block/unblock group (`POST /groups/:id/block`, `POST /groups/:id/unblock` setting `blocked_at`/`blocked_by_user_id`). Blocked groups reject member mutations (expenses, settlements, invites) with 403. Creator becomes `GroupMember.role = admin`. Platform `admin` bypasses membership for read endpoints only.

**Acceptance criteria:**

- [ ] `POST /groups` — staff only; creator added as admin member
- [ ] `GET /groups` — returns member's groups; platform admin returns all
- [ ] `GET /groups/:id` — member or platform admin; 403 for non-member user
- [ ] `DELETE /groups/:id/members/:userId` — in-group admin only; platform admin and regular members get 403
- [ ] `POST /groups/:id/block` and `POST /groups/:id/unblock` — platform admin only
- [ ] Blocked group returns 403 on POST/PATCH/DELETE mutations; GET expenses, balances, and settlements still succeed for members
- [ ] `GET /users/lookup?email=` — group admin search for registered user

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `GroupsService.create`, `GroupsService.findAll`, `GroupsService.blockGroup`, `GroupsService.unblockGroup`, membership guard, admin read bypass, remove member auth
- Edge cases: non-staff create → 403; platform admin cannot remove member; mutation on blocked group → 403
- Test type: unit
- Suggested file: `apps/api/src/modules/groups/groups.service.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:api`
- [ ] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: Swagger — staff creates group, user gets 403 on foreign group

**Dependencies:** Task 6

**Files likely touched:**

- `apps/api/src/modules/groups/groups.module.ts`
- `apps/api/src/modules/groups/groups.controller.ts`
- `apps/api/src/modules/groups/groups.service.ts`
- `apps/api/src/modules/groups/dto/`
- `apps/api/src/common/guards/` or shared membership helper

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `api-and-interface-design`

---

## Task 8: Group invites backend — SMTP invite, accept/decline, lookup, `/invites/me`

**Description:** Add invitation flows to `GroupsModule`: send invite by email (creates pending row + SMTP), list pending for group admin, accept via token (`POST /invites/accept`) or in-app (`POST /invites/:id/accept`), decline, and `GET /invites/me` for logged-in user's pending invites. Normalize emails lowercase. Set `responded_at` on accept/decline.

**Acceptance criteria:**

- [ ] `POST /groups/:id/invites` sends invite email via MailService; creates pending invitation
- [ ] Duplicate pending invite for same email → 409 or 400
- [ ] `POST /invites/accept` with token creates GroupMember and marks invite accepted
- [ ] `POST /invites/:id/decline` sets status declined + responded_at
- [ ] `GET /invites/me` returns pending invites for current user's email/userId
- [ ] Expired invite token → 400

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `GroupsService.sendInvite`, `GroupsService.acceptInvite`, token validation, email normalization
- Edge cases: accept after register links invitee_user_id; expired invite; non-invitee accept → 403
- Test type: unit
- Suggested file: `apps/api/src/modules/groups/groups.service.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:api`
- [ ] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: send invite → Mailpit link → accept → member in group

**Dependencies:** Task 7

**Files likely touched:**

- `apps/api/src/modules/groups/groups.controller.ts`
- `apps/api/src/modules/groups/groups.service.ts`
- `apps/api/src/modules/groups/dto/`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `api-and-interface-design`, `security-and-hardening`

---

## Task 9: Groups frontend — `/groups` list and create-group flow (staff)

**Description:** Add `/groups` page with TanStack Query list, EmptyState, LoadingState, and role-gated "Create group" for staff. Create-group dialog/form (name + currency). Link to group detail. Platform admin sees all groups. Use `@shared/ui/components` throughout.

**Acceptance criteria:**

- [ ] `/groups` lists user's groups from API with loading/empty/error states
- [ ] Staff sees create group form; user role does not
- [ ] Platform admin sees all groups
- [ ] Successful create navigates to `/groups/[id]`
- [ ] TanStack Query owns server list; no groups array in Redux

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: groups API client list/create, role-gated UI helper
- Edge cases: empty list shows EmptyState; API error shows Alert
- Test type: unit
- Suggested file: `apps/web/lib/groups-api.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: login as staff → create group → appears in list

**Dependencies:** Task 8

**Files likely touched:**

- `apps/web/app/groups/page.tsx`
- `apps/web/lib/api.ts` or `apps/web/lib/groups-api.ts`
- `libs/shared-types/src/index.ts`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `frontend-ui-engineering`

---

## Task 10: Invites frontend — invite form and `/invites/accept` page

**Description:** Add group admin invite UI on group detail (email input + send). Add `/invites/accept?token=` page with login redirect if needed. Show pending invites for current user (optional banner on `/groups`). Wire to invite API client methods.

**Acceptance criteria:**

- [ ] Group admin can enter email and send invite from group detail
- [ ] `/invites/accept?token=` accepts invite or prompts login then accepts
- [ ] Success navigates to group detail; error shows Alert
- [ ] Invite email received in Mailpit with working link

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: invite API client send/accept, token from URL
- Edge cases: unauthenticated accept redirects to login with returnUrl
- Test type: unit
- Suggested file: `apps/web/lib/groups-api.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: invite flow end-to-end in browser with Mailpit

**Dependencies:** Task 9

**Files likely touched:**

- `apps/web/app/groups/[id]/page.tsx` (partial — invite section)
- `apps/web/app/invites/accept/page.tsx`
- `apps/web/lib/groups-api.ts`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `frontend-ui-engineering`

---

## Checkpoint: Groups E2E

- [ ] Staff creates group → invite → accept → member visible
- [ ] Non-member 403 on foreign group
- [ ] Platform admin can view any group

---

## Task 11: Expenses backend — create, list/filter, get, admin PATCH, soft-delete, audit

**Description:** Implement `ExpensesModule` with transactional create (expense + shares), share-sum validation, largest-remainder helper, paginated list with `from`/`to`/`payerUserId` filters, get by id, admin-only PATCH (replace shares in transaction), soft-delete with `deleted_by_user_id`, and `GET .../expenses/deleted` audit list. Enforce payer and share users are group members.

**Acceptance criteria:**

- [ ] `POST /groups/:id/expenses` — transaction; 400 if shares sum ≠ amountCents
- [ ] `GET /groups/:id/expenses` — pagination (default page size 10), date range + payer filters; excludes soft-deleted
- [ ] `PATCH /groups/:id/expenses/:id` — group admin only; re-validates share sum
- [ ] `DELETE /groups/:id/expenses/:id` — soft-delete; sets deleted_at + deleted_by_user_id
- [ ] `GET /groups/:id/expenses/deleted` — admin audit list
- [ ] Non-member → 403; non-admin PATCH → 403

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `ExpensesService.validateShareSum`, `ExpensesService.create`, `splitEqually` largest-remainder, soft-delete excludes from list
- Edge cases: $100/3 = [3334,3333,3333]; zero amount → 400; share for non-member → 400
- Test type: unit
- Suggested file: `apps/api/src/modules/expenses/expenses.service.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:api`
- [ ] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: Swagger create valid/invalid shares; filter by payer and date

**Dependencies:** Task 8

**Files likely touched:**

- `apps/api/src/modules/expenses/`
- `apps/api/src/common/utils/split.util.ts` (or similar)

**Estimated scope:** Large: 5-8 files

**Domain skill:** `api-and-interface-design`

---

## Task 12: Expenses frontend — group detail expense list, filters, add-expense split editor

**Description:** Build group detail page expense section: TanStack Query expense list with RTK filter drafts (date range, payer), LoadingState/EmptyState, add-expense form with dynamic share rows and live sum indicator, client-side sum validation before submit. Admin delete with confirm dialog.

**Acceptance criteria:**

- [ ] Expense list shows payer, amount, date, description with loading/empty/error states
- [ ] Filters apply via RTK draft → Query refetch (date range + payer)
- [ ] Add expense form validates share sum client-side; disables submit on mismatch
- [ ] API 400 on sum mismatch shows user-friendly error
- [ ] Admin sees delete action with confirmation dialog

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: client share sum validator, equal-split helper
- Edge cases: empty shares row set blocked; filter clear restores list
- Test type: unit
- Suggested file: `apps/web/lib/expenses-utils.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: add $100 expense split 4 ways; invalid sum rejected in UI and API

**Dependencies:** Task 11

**Files likely touched:**

- `apps/web/app/groups/[id]/page.tsx`
- `apps/web/lib/expenses-api.ts`
- `apps/web/lib/store/index.ts` (extend filter slice)

**Estimated scope:** Large: 5-8 files

**Domain skill:** `frontend-ui-engineering`

---

## Checkpoint: Expenses

- [ ] Valid expense saves; invalid share sum → 400
- [ ] Date and payer filters work
- [ ] Soft-delete hidden from list; visible in audit API

---

## Task 13: Balances backend — net computation and simplified debts endpoint

**Description:** Implement `BalancesModule` with pure computation service: per-member net from non-deleted expenses and settlements, greedy simplified debt pairing. Expose `GET /groups/:id/balances` returning member nets and suggested who-owes-whom list. Platform admin read access. No balance table.

**Acceptance criteria:**

- [ ] Balance excludes soft-deleted expenses
- [ ] Net formula matches SPEC (paid − owed + received − paid_out)
- [ ] Simplified debts list pairs creditors/debtors correctly
- [ ] Empty group returns all-zero nets and empty debts
- [ ] Non-member → 403; platform admin allowed

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `BalancesService.computeNets`, `BalancesService.simplifyDebts`
- Edge cases: after settlement nets update; deleted expense recalculates; single member group
- Test type: unit
- Suggested file: `apps/api/src/modules/balances/balances.service.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:api`
- [ ] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: seed data balances match manual calculation

**Dependencies:** Task 11

**Files likely touched:**

- `apps/api/src/modules/balances/balances.module.ts`
- `apps/api/src/modules/balances/balances.service.ts`
- `apps/api/src/modules/balances/balances.controller.ts`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `api-and-interface-design`

---

## Task 14: Settlements backend — create with debt cap, list history

**Description:** Implement `SettlementsModule`: `POST /groups/:id/settlements` records payment between two members with `created_by_user_id`; validate amount ≤ outstanding debt between pair (400 if exceeds). `GET /groups/:id/settlements` returns history. Transactional insert.

**Acceptance criteria:**

- [ ] Settlement creates row with payer, payee, amount, note, settled_at, created_by_user_id
- [ ] Amount exceeding pairwise debt → 400
- [ ] payer_user_id ≠ payee_user_id enforced
- [ ] Both users must be group members
- [ ] List endpoint returns settlements ordered by settled_at desc

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: `SettlementsService.create`, debt cap validation, `getOutstandingDebt`
- Edge cases: settlement after full settle → 400; zero amount → 400
- Test type: unit
- Suggested file: `apps/api/src/modules/settlements/settlements.service.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:api`
- [ ] Static / compile checks pass: `pnpm typecheck:api`
- [ ] Manual check: create settlement; balances endpoint reflects reduced debt

**Dependencies:** Task 13

**Files likely touched:**

- `apps/api/src/modules/settlements/`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `api-and-interface-design`

---

## Task 15: Balances frontend — `/groups/[id]/balances` and settle-up dialog

**Description:** Add `/groups/[id]/balances` page showing who-owes-whom table from balances API, "all clear" EmptyState, and settle-up Dialog pre-filled from suggested debts. TanStack Query for balances and settlement mutation with invalidation. Cap amount at outstanding debt client-side.

**Acceptance criteria:**

- [ ] Balances page shows simplified debts with member names
- [ ] Settle-up dialog submits settlement and refreshes balances
- [ ] All-clear state when no debts remain
- [ ] Loading/error states distinct from empty
- [ ] After settlement, balances update without full page reload

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: settlements API client, query invalidation keys
- Edge cases: settle max amount capped; API 400 shown in Alert
- Test type: unit
- Suggested file: `apps/web/lib/settlements-api.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: expense → balances → settle → all clear

**Dependencies:** Task 14, Task 12

**Files likely touched:**

- `apps/web/app/groups/[id]/balances/page.tsx`
- `apps/web/lib/balances-api.ts`
- `apps/web/lib/settlements-api.ts`

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `frontend-ui-engineering`

---

## Checkpoint: Core Splitter E2E

- [ ] Expense → balances → settlement → all clear
- [ ] Settlement over debt → 400
- [ ] $100/3 split totals exactly 10000 cents

---

## Task 16: Admin expense edit UI and deleted-expenses audit view

**Description:** Add group admin expense edit: opens split editor pre-filled, PATCH on save. Add audit tab/section listing soft-deleted expenses with deleted badge/strikethrough for group admin and platform admin. Wire to PATCH and deleted-list endpoints.

**Acceptance criteria:**

- [ ] Group admin sees edit action on expense rows; member does not
- [ ] Edit form re-validates share sum; PATCH on save
- [ ] Audit view shows soft-deleted expenses with deleted badge
- [ ] Deleted expenses not shown in main list
- [ ] Bookmark to deleted expense id shows "no longer available" (404 UX)

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: edit form initializes from expense detail, PATCH payload shape
- Edge cases: non-admin edit button hidden; edit deleted expense blocked
- Test type: component
- Suggested file: `apps/web/lib/expenses-api.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: admin edits expense shares; audit list shows deleted item

**Dependencies:** Task 12

**Files likely touched:**

- `apps/web/app/groups/[id]/page.tsx`
- `apps/web/components/expenses/` (new)

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `frontend-ui-engineering`

---

## Task 17: Route protection, email-verified gate, and role-based UI

**Description:** Extend Next middleware/layout guards: unauthenticated → login with returnUrl; unverified → block `/groups/*` with resend CTA; role-based nav hides staff/admin actions. Platform admin sees all groups read-only plus block/unblock control per group. Shell header reflects role. Show blocked-group banner and disable mutation actions when `blockedAt` is set.

**Acceptance criteria:**

- [ ] Unauthenticated access to `/groups/*` redirects to `/login?returnUrl=...`
- [ ] Unverified user blocked from `/groups/*` with verify/resend UX
- [ ] Staff-only create group hidden for `user` role
- [ ] Group admin actions (edit, delete, invite, remove member) hidden for plain members
- [ ] Platform admin sees block/unblock on group detail; no expense edit or member-remove controls
- [ ] Blocked group shows banner; add expense, settle, and invite disabled in UI; expense list and balances remain visible (read-only)

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: middleware matcher paths, role visibility helper
- Edge cases: verified user passes; admin bypass on group routes
- Test type: unit
- Suggested file: `apps/web/middleware.spec.ts` (if added)

**Verification:**

- [ ] Build succeeds: `pnpm build:web`
- [ ] Static / compile checks pass: `pnpm typecheck:web`
- [ ] Manual check: try staff URLs as user → access denied; unverified blocked from groups

**Dependencies:** Task 5, Task 15

**Files likely touched:**

- `apps/web/middleware.ts`
- `apps/web/components/auth/shell-header.tsx`
- `apps/web/app/groups/layout.tsx` (new)

**Estimated scope:** Medium: 3-5 files

**Domain skill:** `security-and-hardening`, `frontend-ui-engineering`

---

## Task 18: Shared Zod types, `docs/architecture.md`, and demo script

**Description:** Finalize `@shared/types` Zod schemas for groups, expenses, shares, settlements, balances responses. Fill `docs/architecture.md` domain notes (ERD summary, invariants, auth/mail architecture) and 5-minute demo script. Ensure all API client methods use shared types.

**Acceptance criteria:**

- [ ] Zod schemas for all domain entities and list/balance response shapes
- [ ] `docs/architecture.md` domain notes and demo script sections filled
- [ ] Demo script covers: roles, happy path, share invariant 4xx, filters
- [ ] No references implying auth lives on gateway

**Unit Tests (deferred):**

- [ ] Tests written
- Functions/behaviors to cover: Zod schema parse for sample API payloads
- Edge cases: invalid balance response fails parse in client
- Test type: unit
- Suggested file: `libs/shared-types/src/index.spec.ts`

**Verification:**

- [ ] Build succeeds: `pnpm build`
- [ ] Static / compile checks pass: `pnpm typecheck`
- [ ] Manual check: read architecture.md — accurate ERD and flow description

**Dependencies:** Task 15

**Files likely touched:**

- `libs/shared-types/src/index.ts`
- `docs/architecture.md`

**Estimated scope:** Small: 1-2 files

**Domain skill:** None

---

## Checkpoint: Complete

- [ ] All Must success criteria in SPEC.md satisfied
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm lint` pass
- [ ] 5-minute demo script in architecture.md ready for PR
- [ ] Human review before Should-tier work
