# Splitter — Application Flow

End-to-end sequence diagrams for the Splitter backend (`apps/api`). These show how the browser, web app, API, database, and mail service interact from first registration through settling a debt.

For setup instructions, see the [API README](../README.md).

---

## High-level architecture

```mermaid
flowchart LR
  Browser["Browser"]
  Web["Next.js web\n:3000"]
  API["NestJS API\n:3002"]
  DB[(PostgreSQL)]
  SMTP["SMTP server"]

  Browser --> Web
  Web -->|" /api/* proxy\ncookie JWT"| API
  API --> DB
  API --> SMTP
```

---

## 1. Registration and email verification

New users must verify email before they can log in.

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Web as Web (:3000)
  participant API as API (:3002)
  participant DB as PostgreSQL
  participant Mail as SMTP

  User->>Web: Submit register form
  Web->>API: POST /auth/register { email, name, password }
  API->>DB: INSERT user (email_verified_at = null)
  API->>DB: INSERT email_verification_token (hashed)
  API->>Mail: Send verification email
  Note over Mail: Link: APP_PUBLIC_URL/verify-email?token=...
  Mail-->>User: Verification email
  API-->>Web: 201 { data: publicUser }
  Web-->>User: "Check your inbox"

  User->>Web: Open verify-email link
  Web->>API: POST /auth/verify-email { token }
  API->>DB: Validate token hash, not expired
  API->>DB: SET email_verified_at = now()
  API->>DB: DELETE verification token
  API-->>Web: 200 { data: publicUser }
  Web-->>User: Redirect to login
```

**Resend verification:** `POST /auth/resend-verification { email }` — same mail path, new token.

---

## 2. Login and session

Auth uses an httpOnly `access_token` cookie. Subsequent requests include it automatically when `credentials: 'include'`.

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Web as Web (:3000)
  participant API as API (:3002)
  participant DB as PostgreSQL

  User->>Web: Submit login form
  Web->>API: POST /auth/login { email, password }
  API->>DB: Find user by email
  alt Email not verified
    API-->>Web: 403 Email not verified
  else Invalid credentials
    API-->>Web: 401 Invalid email or password
  else Success
    API->>API: Sign JWT
    API-->>Web: 200 Set-Cookie: access_token (httpOnly)
    Web-->>User: Redirect to dashboard

    User->>Web: Navigate protected page
    Web->>API: GET /auth/me (cookie)
    API->>API: Validate JWT (global guard)
    API-->>Web: 200 { data: currentUser }
  end
```

**Logout:** `POST /auth/logout` clears the cookie.

**Forgot password:** `POST /auth/forgot-password` → email with reset link → `POST /auth/reset-password { token, password }`.

---

## 3. Create group and invite members

Any authenticated user can create a group. Any group member can send invites.

```mermaid
sequenceDiagram
  autonumber
  actor Admin as Group creator
  participant Web as Web (:3000)
  participant API as API (:3002)
  participant DB as PostgreSQL
  participant Mail as SMTP
  actor Invitee

  Admin->>Web: Create group (name, currency)
  Web->>API: POST /groups { name, currency }
  API->>DB: INSERT group
  API->>DB: INSERT group_member (role: admin)
  API-->>Web: 201 { data: group }
  Web-->>Admin: Group detail page

  Admin->>Web: Invite by email
  Web->>API: POST /groups/:id/invites { email }
  API->>DB: Verify caller is member, group not blocked
  API->>DB: INSERT group_invitation (token hash, pending)
  API->>Mail: Send invite email
  Note over Mail: Link: APP_PUBLIC_URL/invites/accept?token=...
  Mail-->>Invitee: Invitation email
  API-->>Web: 201 { data: invitation }

  Invitee->>Web: Open /invites/accept?token=...
  Web->>API: GET /invites/preview?token= (public)
  API->>DB: Lookup invitation by token hash
  API-->>Web: Group name, inviter, expiry

  alt Invitee has no account
    Invitee->>Web: Register or login (return URL preserved)
    Note over Web: Flow continues in section 1 & 2
  end

  Invitee->>Web: Accept invite
  Web->>API: POST /invites/accept { token }
  API->>DB: Validate invitation (pending, not expired)
  API->>DB: INSERT group_member (role: member)
  API->>DB: Mark invitation accepted
  API-->>Web: 200 { data: group }
  Web-->>Invitee: Redirect to group
```

---

## 4. Add expense and split shares

Expenses store an total in **integer cents**. Shares must sum exactly to `amountCents`.

```mermaid
sequenceDiagram
  autonumber
  actor Member
  participant Web as Web (:3000)
  participant API as API (:3002)
  participant DB as PostgreSQL

  Member->>Web: Add expense (amount, payer, split)
  Web->>Web: Validate share sum = total (UI)
  Web->>API: POST /groups/:id/expenses
  Note over API: { description, amountCents, paidByUserId, shares[] }

  API->>DB: Verify membership, group not blocked
  alt Share sum ≠ amountCents
    API-->>Web: 400 Share amounts must equal expense total
  else Valid
    API->>DB: INSERT expense
    API->>DB: INSERT shares (user_id, amount_cents)
    API-->>Web: 201 { data: expense }
    Web-->>Member: Expense appears in list
  end
```

**Equal split:** API applies largest-remainder rounding (e.g. $100 ÷ 3 → 3334, 3333, 3333 cents).

**Edit / delete:** Group admin only — `PATCH` / `DELETE /groups/:id/expenses/:expenseId`. Soft-delete keeps audit trail.

---

## 5. View balances (computed at read time)

Balances are **not stored** in a ledger table. They are derived from non-deleted expenses minus settlements.

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Web as Web (:3000)
  participant API as API (:3002)
  participant DB as PostgreSQL

  User->>Web: Open group balances
  Web->>API: GET /groups/:id/balances
  API->>DB: Load members, expenses (+ shares), settlements
  API->>API: Compute net balance per member
  API->>API: Simplify debts (who owes whom)
  API-->>Web: 200 { data: { members, debts, totals } }
  Web-->>User: "Alice owes Bob $12.50"
```

**Global balances page:** Web loads accessible groups, then fetches per-group balances.

---

## 6. Record settlement

A settlement records that one member paid another, reducing outstanding debt.

```mermaid
sequenceDiagram
  autonumber
  actor Payer
  participant Web as Web (:3000)
  participant API as API (:3002)
  participant DB as PostgreSQL

  Payer->>Web: Settle debt (amount, payee)
  Web->>API: POST /groups/:id/settlements
  Note over API: { payerUserId, payeeUserId, amountCents }

  API->>DB: Verify membership, group not blocked
  API->>API: Recompute outstanding pairwise balance
  alt amountCents > outstanding
    API-->>Web: 400 Settlement exceeds outstanding balance
  else Valid
    API->>DB: INSERT settlement
    API-->>Web: 201 { data: settlement }
    Web->>API: GET /groups/:id/balances (refetch)
    API-->>Web: Updated nets
    Web-->>Payer: Balances refresh
  end
```

**Settlement history:** `GET /groups/:id/settlements` (per group) or `GET /settlements` (all groups, paginated).

---

## 7. End-to-end happy path

Combined flow from new user to settled group — the primary demo script.

```mermaid
sequenceDiagram
  autonumber
  actor Alice as Alice (creator)
  actor Bob as Bob (invitee)
  participant Web as Web
  participant API as API
  participant DB as DB
  participant Mail as Mail

  rect rgb(240, 248, 255)
    Note over Alice,Mail: Auth
    Alice->>Web: Register
    Web->>API: POST /auth/register
    API->>Mail: Verification email
    Alice->>Web: Verify email
    Web->>API: POST /auth/verify-email
    Alice->>Web: Login
    Web->>API: POST /auth/login → cookie
  end

  rect rgb(240, 255, 240)
    Note over Alice,Bob: Group & invite
    Alice->>Web: Create "Trip 2025"
    Web->>API: POST /groups
    API->>DB: group + admin member
    Alice->>Web: Invite bob@example.com
    Web->>API: POST /groups/:id/invites
    API->>Mail: Invite link
    Bob->>Web: Accept invite (register if needed)
    Web->>API: POST /invites/accept
    API->>DB: Bob → group_member
  end

  rect rgb(255, 248, 240)
    Note over Alice,Bob: Expense
    Alice->>Web: Add $60 dinner, Alice paid, split equally
    Web->>API: POST /groups/:id/expenses
    API->>DB: expense + 2 shares ($30 each)
  end

  rect rgb(255, 240, 245)
    Note over Alice,Bob: Balance & settle
    Bob->>Web: View balances
    Web->>API: GET /groups/:id/balances
    API-->>Web: Bob owes Alice $30
    Bob->>Web: Settle $30 to Alice
    Web->>API: POST /groups/:id/settlements
    API->>DB: settlement record
    Web->>API: GET /groups/:id/balances
    API-->>Web: All settled (zero debt)
  end
```

---

## 8. Blocked group (read-only)

Platform admins can block a group. Members retain read access; mutations return **403**.

```mermaid
sequenceDiagram
  autonumber
  actor Admin as Platform admin
  participant Web as Web
  participant API as API
  participant DB as DB
  actor Member

  Admin->>Web: Block group
  Web->>API: POST /groups/:id/block
  API->>DB: SET blocked_at, blocked_by

  Member->>Web: View expenses / balances
  Web->>API: GET /groups/:id/expenses
  API-->>Web: 200 (read allowed)

  Member->>Web: Add expense
  Web->>API: POST /groups/:id/expenses
  API-->>Web: 403 Group is blocked
```

---

## Entity relationships (reference)

```mermaid
erDiagram
  users ||--o{ group_members : "belongs to"
  groups ||--o{ group_members : "has"
  groups ||--o{ group_invitations : "has"
  groups ||--o{ expenses : "has"
  expenses ||--o{ shares : "split into"
  users ||--o{ shares : "owes"
  groups ||--o{ settlements : "has"
  users ||--o{ settlements : "payer"
  users ||--o{ settlements : "payee"
  users ||--o{ email_verification_tokens : "has"
  users ||--o{ password_reset_tokens : "has"
```

---

## Key invariants

| Rule                                 | Enforcement                  |
| ------------------------------------ | ---------------------------- |
| Share sum = expense total            | 400 on mismatch              |
| Settlement ≤ outstanding debt        | 400 on exceed                |
| Verified email required to login     | 403 until verified           |
| Invite tokens stored as SHA-256 hash | Raw token only in email      |
| Blocked group = no mutations         | 403 on POST/PATCH/DELETE     |
| Money in integer cents               | Never use floats for amounts |

See [docs/architecture.md](../../../docs/architecture.md) for full domain rules.
