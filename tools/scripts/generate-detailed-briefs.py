#!/usr/bin/env python3
"""Generate narrative, scope-heavy project briefs for the monorepo starter."""
from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "docs" / "projects"


def page(title: str, slug: str, body: str) -> str:
    return f"""# {title}

| | |
| --- | --- |
| **Slug** | `{slug}` |
| **Git branch** | `<dev-name>/{slug}` (example: `ada/{slug}`) |
| **Where to code** | Nest: `apps/api/` · Next: `apps/web/` |
| **URLs** | API `http://localhost:3001` · Web `http://localhost:3000` |
| **Database** | Postgres `app` (`pnpm docker:db`) |
| **Effort** | 5–6 days solo · difficulty **4 / 5** |

> Read this entire brief before writing code. Grading follows **Scope of work** below plus [grading.md](../grading.md) and [stack.md](../stack.md).

{body.strip()}
"""


def sectioned(
    *,
    what: str,
    why: str,
    journeys: dict[str, str],
    features: dict[str, str],
    must: list[tuple[str, str]],
    should: list[str],
    out: list[str],
    rules: list[str],
    entities: list[tuple[str, str]],
    erd: str,
    api: list[tuple[str, str, str, str]],
    routes: list[tuple[str, str]],
    days: list[tuple[str, str, str]],
    seed: str,
    demo: list[str],
    pitfalls: list[str],
) -> str:
    j = "\n".join(f"### {k}\n\n{v.strip()}\n" for k, v in journeys.items())
    f = "\n".join(f"### {k}\n\n{v.strip()}\n" for k, v in features.items())
    must_t = "\n".join(f"| {a} | {b} |" for a, b in must)
    should_l = "\n".join(f"- {x}" for x in should)
    out_l = "\n".join(f"- {x}" for x in out)
    rules_l = "\n".join(f"{i}. {r}" for i, r in enumerate(rules, 1))
    ent = "\n".join(f"| `{a}` | {b} |" for a, b in entities)
    api_t = "\n".join(f"| `{m}` | `{p}` | {w} | {b} |" for m, p, w, b in api)
    routes_t = "\n".join(f"| `{a}` | {b} |" for a, b in routes)
    days_t = "\n".join(f"| {a} | {b} | {c} |" for a, b, c in days)
    demo_l = "\n".join(f"{i}. {x}" for i, x in enumerate(demo, 1))
    pit = "\n".join(f"- {x}" for x in pitfalls)
    return f"""
## What you are building

{what.strip()}

## Why this project (skills you prove)

{why.strip()}

## Who uses it — user journeys

{j}

## Functionalities (product behaviour)

{f}

## Scope of work

### Must — required to pass

| Deliverable | “Done” looks like |
| --- | --- |
{must_t}

Also required for every project: cookie JWT (no `localStorage` tokens), TypeORM **migrations only**, TanStack Query for server lists, RTK only for drafts/filters, filled `docs/architecture.md`, and a ≤5 minute demo.

### Should — strong / distinction submission

{should_l}

### Explicitly out of scope

{out_l}

Do **not** spend Must-days on out-of-scope items. If you finish early, pick from Should, then Stretch ideas only if time remains.

## Business / domain rules (API must enforce)

{rules_l}

## Data model

| Entity | Role in the product |
| --- | --- |
{ent}

```mermaid
{erd.strip()}
```

## HTTP API sketch

Expand paths/DTOs as needed; keep cookies + validation pipes.

| Method | Path | Actor | Behaviour |
| --- | --- | --- | --- |
{api_t}

List endpoints return `{{ data, meta: {{ page, pageSize, total, totalPages }} }}` with filters applied to **both** rows and totals.

## Screens / routes to implement

| Route | What the user does here |
| --- | --- |
{routes_t}

UX rules: empty ≠ loading ≠ error; filter text lives in RTK until Apply; Nest is the only product API.

## Suggested calendar (5–6 days)

| Day | Focus | Exit criteria |
| --- | --- | --- |
{days_t}

## Seed data

{seed.strip()}

Demo password for seeded users: `password123`.

## Demo script (≤5 minutes)

{demo_l}

## Common pitfalls

{pit}
"""


SPECS: list[tuple[str, str, str, dict]] = []


def add(file: str, title: str, slug: str, **kwargs):
    SPECS.append((file, title, slug, kwargs))


add(
    "01-job-portal.md",
    "Job Portal",
    "job-portal",
    what="""
You are building a **compact job marketplace** (Naukri / LinkedIn Jobs lite).

Companies publish openings. Candidates search, open a job page, apply with a cover letter, and optionally bookmark roles or attach a resume link. Companies review applicants through a small hiring pipeline and close roles when filled. An admin can suspend abusive companies.

This is a full “post → apply → review → close” product loop — **not** a full ATS (no interview scheduling, no email campaigns, no assessments).
""",
    why="""
Multi-role authorization, application status state machine, unique “one apply per job”, and a **transaction** that closes a job while rejecting leftover applications. UI: searchable catalog with RTK filter drafts + Query lists.
""",
    journeys={
        "Candidate": """
1. Register/login as candidate.  
2. Browse `/jobs` (search + location).  
3. Open a job → Apply. Second apply must fail clearly (**409**).  
4. Bookmark jobs; set a resume URL.  
5. Use a candidate dashboard to track application statuses.
""",
        "Company": """
1. Login as company → create company profile.  
2. Post/edit jobs.  
3. Review applicants; move statuses only along allowed edges.  
4. Close a job → remaining open applications become rejected in the **same database transaction**.
""",
        "Admin": """
Suspend a company (blocks new posts) and/or force-close jobs when needed.
""",
    },
    features={
        "Accounts & roles": "Cookie JWT from boilerplate. Map `staff`→company and `user`→candidate (document in docs/architecture.md).",
        "Company profile": "Name, website, owner user, optional `suspendedAt`.",
        "Job catalog": "Title, location, description, `open|closed`, soft-delete. Paginated list with `q` + location.",
        "Applications": "Cover letter + status pipeline (`submitted → reviewing → rejected|hired`).",
        "Bookmarks & resume (Should)": "Save jobs; store resume as URL or simple local upload stub.",
        "Dashboards (Should)": "Company applicant counts; candidate “my applications”; admin moderation tools.",
    },
    must=[
        ("Role-safe Nest modules", "Wrong role → 403; anonymous → 401"),
        ("Company + job CRUD", "Owner scoped; seeded demo data"),
        ("Apply + status machine", "Illegal transition → 400"),
        ("Close-job transaction", "Open apps rejected atomically"),
        ("Double-apply guard", "DB unique + 409"),
        ("Jobs UI", "List/detail/apply with Query states"),
    ],
    should=[
        "Company & candidate dashboards",
        "Bookmarks",
        "Resume URL/file stub",
        "Admin suspend company",
        "Filter applications by status on company view",
    ],
    out=[
        "Production email/SMS notifications",
        "S3/Cloudinary as a Must requirement",
        "Elasticsearch",
        "Recruiter↔candidate chat",
        "Video interviews / offer PDFs",
    ],
    rules=[
        "At most one application per (job, candidate).",
        "Only allow documented status transitions.",
        "Closing a job rejects applications still in submitted/reviewing.",
        "Candidates only see/change their own applications; companies only their jobs.",
    ],
    entities=[
        ("Company", "Employer profile"),
        ("Job", "Open/closed role"),
        ("Application", "Pipeline record"),
        ("Bookmark", "Saved job"),
        ("ResumeMeta", "Resume pointer"),
    ],
    erd="""
erDiagram
  User ||--o| Company : owns
  Company ||--o{ Job : posts
  Job ||--o{ Application : receives
  User ||--o{ Application : submits
  User ||--o{ Bookmark : saves
  Job ||--o{ Bookmark : bookmarked
""",
    api=[
        ("POST", "/companies", "company", "Create profile"),
        ("GET", "/jobs", "auth", "Search + pagination"),
        ("POST", "/jobs", "company", "Create open job"),
        ("POST", "/jobs/:id/close", "owner/admin", "TX close + reject apps"),
        ("POST", "/jobs/:id/applications", "candidate", "Apply"),
        ("PATCH", "/applications/:id/status", "company", "Advance pipeline"),
        ("GET/POST", "/bookmarks", "candidate", "Should"),
        ("PUT", "/me/resume", "candidate", "Should"),
    ],
    routes=[
        ("/jobs", "Search catalog"),
        ("/jobs/[id]", "Detail, apply, bookmark"),
        ("/dashboard/company", "Jobs + applicants"),
        ("/dashboard/candidate", "My applications"),
        ("/admin", "Suspend / force-close"),
        ("/login", "Auth"),
    ],
    days=[
        ("1", "ERD, migrations, seed, roles", "Three personas can log in"),
        ("2", "Jobs/applications API + close TX", "curl/Swagger proofs"),
        ("3", "Next list/detail/apply", "Candidate happy path"),
        ("4", "Company dashboard + RTK filters", "Apply-filter pattern"),
        ("5", "Should features", "Bookmarks/resume/admin"),
        ("6", "docs/architecture.md + demo", "PR ready"),
    ],
    seed="2 companies, 8 jobs (varied locations), 3 candidates, 5 applications in mixed statuses, sample bookmarks.",
    demo=[
        "Company creates a job",
        "Candidate searches, applies, bookmarks",
        "Company moves submitted → reviewing → hired",
        "Close another job that still has open apps → they become rejected",
        "Second apply to same job → 409",
    ],
    pitfalls=[
        "Closing without rejecting open applications",
        "JWT in localStorage",
        "Putting jobs[] into Redux",
        "Filter on rows but not on COUNT",
    ],
)

# --- remaining 15 with same richness ---
add(
    "02-ecommerce-marketplace.md",
    "E-commerce Marketplace",
    "ecommerce-marketplace",
    what="""
You are building a **mini multi-vendor storefront**: sellers list products with stock; buyers browse, cart, and checkout; the system must never sell inventory it does not have.

Optional polish (Should): coupons, product reviews, seller dashboard, simple order status timeline. Payments are **mocked** (no Stripe).
""",
    why="""
The flagship skill is a **correct checkout transaction** (order + lines + stock decrement + clear cart). You also practice seller vs buyer authorization and catalog filtering.
""",
    journeys={
        "Buyer": "Browse catalog → product detail → add to cart → adjust qty → checkout → view orders → (Should) review a purchased item.",
        "Seller": "Create products with stock → update/soft-delete → see order lines for own products on a dashboard.",
        "Admin": "Optional moderation of catalog/orders.",
    },
    features={
        "Catalog": "Paginated products with search and min/max price. Detail shows price and availability.",
        "Inventory": "Quantity per product; checkout decrements; never negative.",
        "Cart": "Per-buyer lines; block deleted/invalid products.",
        "Checkout": "Atomic create order + lines + decrement stock + clear cart. Insufficient stock → 409.",
        "Orders": "Buyer history; seller sees relevant lines; optional status workflow.",
        "Coupons & reviews (Should)": "Expiring codes; one review per buyer per product.",
    },
    must=[
        ("Product + inventory", "Seeded catalog with stock"),
        ("Cart API/UI", "Add/update/remove"),
        ("Checkout transaction", "Success + oversell 409"),
        ("Order history", "Buyer can list orders"),
        ("Catalog filters", "Pagination + q/price"),
    ],
    should=["Coupons", "Reviews", "Seller dashboard", "Order statuses", "Hide soft-deleted products"],
    out=["Real payment gateways", "Multi-currency FX engine", "Carrier tracking APIs", "Full CMS storefront builder"],
    rules=[
        "Stock check and decrement happen inside the checkout transaction.",
        "Buyers only access their cart/orders.",
        "Sellers only mutate their products.",
        "Soft-deleted products cannot be newly added to carts.",
    ],
    entities=[
        ("Product", "Seller catalog item"),
        ("Inventory", "Stock qty"),
        ("CartItem", "Buyer line"),
        ("Order", "Checkout header"),
        ("OrderLine", "Purchased snapshot"),
        ("Coupon", "Discount"),
        ("Review", "Rating"),
    ],
    erd="""
erDiagram
  User ||--o{ Product : sells
  Product ||--|| Inventory : stock
  User ||--o{ CartItem : carts
  User ||--o{ Order : places
  Order ||--o{ OrderLine : lines
  Product ||--o{ Review : has
""",
    api=[
        ("CRUD", "/products", "seller", "Catalog"),
        ("GET", "/products", "auth", "Search"),
        ("CRUD", "/cart", "buyer", "Cart"),
        ("POST", "/checkout", "buyer", "TX"),
        ("GET", "/orders", "auth", "History"),
        ("POST", "/reviews", "buyer", "Should"),
        ("POST", "/coupons", "admin/seller", "Should"),
    ],
    routes=[
        ("/products", "Catalog"),
        ("/products/[id]", "Detail + add to cart"),
        ("/cart", "Cart"),
        ("/orders", "Orders"),
        ("/seller", "Seller tools"),
    ],
    days=[
        ("1", "Product/inventory seed", "List products in Swagger"),
        ("2", "Cart + checkout TX", "Oversell 409 proven"),
        ("3", "Catalog + cart UI", "Buyer path works"),
        ("4", "Orders UI", "History visible"),
        ("5", "Should polish", "Coupon/review/dashboard"),
        ("6", "Demo", "PR ready"),
    ],
    seed="3 sellers, 12 products with varied stock, 2 coupons, ≥2 completed orders.",
    demo=[
        "Checkout succeeds and stock drops",
        "Force oversell → 409 and no partial order",
        "Buyer sees order; seller sees line",
        "Optional coupon/review",
    ],
    pitfalls=["Stock update outside TX", "Checkout deleted products", "Products array in Redux"],
)

add(
    "03-project-management.md",
    "Project Management (Jira-style)",
    "project-management",
    what="""
A **team issue tracker**: projects, membership, issues with statuses, labels, comments, optional sprints, and an activity timeline. Think Jira/Linear lite — enough for a small squad to run a sprint, not GitHub Enterprise.
""",
    why="Membership authorization, M2M labels, activity auditing, and a board-style UI with filters.",
    journeys={
        "Member": "Open project → create issue → comment → move status on board → filter by label/assignee.",
        "Project lead": "Manage members, labels, sprints; soft-delete issues; inspect activity.",
        "Admin": "Break-glass access across projects (optional).",
    },
    features={
        "Projects & membership": "Create projects; members have lead|member roles; non-members get 403 on mutations.",
        "Issues": "Title/body, status todo/in_progress/done, assignee, optional sprint, soft-delete.",
        "Labels": "Per-project tags; attach on create in one request.",
        "Comments": "Discussion list on an issue.",
        "Activity": "Create/status/assignee changes append timeline events.",
        "Board/sprints (Should)": "Group by status; sprint assignment; my-open-issues view.",
    },
    must=[
        ("Projects + membership", "Non-member blocked"),
        ("Issues + soft-delete", "Scoped to project"),
        ("Comments", "On issue page"),
        ("Labels + filters", "status/label/assignee"),
        ("Activity log", "Visible timeline"),
    ],
    should=["Sprints", "Board UI", "Lead vs member differences", "My issues dashboard"],
    out=["Mandatory fancy DnD library", "WebSocket live board", "Git integrations", "Time billing"],
    rules=[
        "Only members mutate issues.",
        "Status/assignee changes write ActivityLog.",
        "Create issue + labels + activity in one transaction.",
    ],
    entities=[
        ("Project", "Container"),
        ("ProjectMember", "ACL"),
        ("Issue", "Work item"),
        ("Label", "Tag"),
        ("IssueLabel", "M2M"),
        ("Comment", "Discussion"),
        ("Sprint", "Timebox"),
        ("ActivityLog", "Audit"),
    ],
    erd="""
erDiagram
  Project ||--o{ ProjectMember : has
  Project ||--o{ Issue : contains
  Issue }o--o{ Label : tagged
  Issue ||--o{ Comment : has
  Issue ||--o{ ActivityLog : logs
  Project ||--o{ Sprint : plans
""",
    api=[
        ("CRUD", "/projects", "auth", ""),
        ("POST", "/projects/:id/members", "lead", ""),
        ("CRUD", "/projects/:id/issues", "member", "TX create"),
        ("POST", "/issues/:id/comments", "member", ""),
        ("CRUD", "/labels", "lead", ""),
        ("CRUD", "/sprints", "lead", "Should"),
        ("GET", "/issues/:id/activity", "member", ""),
    ],
    routes=[
        ("/projects", "List"),
        ("/projects/[id]", "Overview"),
        ("/projects/[id]/board", "Board"),
        ("/issues/[id]", "Detail"),
    ],
    days=[
        ("1", "Project/member/issue", "Seed 2 projects"),
        ("2", "Labels/comments/activity", "TX proven"),
        ("3", "UI pages", "Happy path"),
        ("4", "Board + filters", "RTK drafts"),
        ("5", "Sprints/perms", "Should"),
        ("6", "Demo", "PR"),
    ],
    seed="2 projects, ≥4 members, ≥15 issues, labels, comments, activity; optional 2 sprints.",
    demo=[
        "Create labeled issue",
        "Change status → activity appears",
        "Non-member → 403",
        "Filter board by label",
    ],
    pitfalls=["Missing membership checks", "Activity only on create", "Refetch every keypress"],
)

# Write remaining projects compactly but still narrative via helper content
REMAINING = [
    (
        "04-lms.md",
        "Learning Management System",
        "lms",
        "An LMS where instructors publish courses with lessons and quizzes; students enroll, learn, submit answers, get graded, and may receive a certificate.",
        "Enrollment uniqueness, nested quiz creation, grading workflow, instructor vs student UX.",
        {
            "Student": "Browse published courses → enroll → read lessons → submit quiz before due date → see grade/certificate.",
            "Instructor": "Create course/lessons/quiz → view submissions → grade → monitor enrollments.",
        },
        {
            "Courses & lessons": "Ordered lesson content; publish flag; soft-delete.",
            "Enrollment": "One row per student per course.",
            "Quizzes": "Questions created with quiz in one TX; due dates enforced.",
            "Submissions & grades": "One submission per student per quiz; instructor scores.",
            "Certificates (Should)": "Issued when completion rules pass.",
        },
        [
            ("Courses/lessons/enrollments", "Student can enroll and open lessons"),
            ("Quiz + questions TX", "Atomic create"),
            ("Submit + due-date rule", "Late → 400"),
            ("Grading", "Score visible to student"),
            ("Catalog filters", "published + q"),
        ],
        ["Instructor dashboard", "Lesson progress tracking", "Certificates", "Soft-delete courses"],
        ["Video streaming CDN", "Proctoring", "SCORM import"],
        [
            "Unique enrollment (course, student).",
            "Reject submissions after dueAt.",
            "Only instructors grade their courses.",
        ],
    ),
    (
        "05-hospital-appointments.md",
        "Hospital Appointment System",
        "hospital-appointments",
        "Patients book doctors via time slots; doctors manage availability; prescriptions and medical notes attach to care. No hospital billing system.",
        "Slot exclusivity, book/cancel transactions, role-separated clinical data.",
        {
            "Patient": "Pick doctor → see free slots → book → cancel (slot frees) → see upcoming appointments.",
            "Doctor": "Define/block slots → view day’s appointments → write notes/Rx after visits.",
        },
        {
            "Doctor profiles": "Specialty/bio linked to user.",
            "Slots": "Free/reserved windows.",
            "Appointments": "One active appointment per slot; cancel soft-deletes and frees slot in one TX.",
            "Notes & Rx (Should)": "Doctor-authored history and prescriptions.",
        },
        [
            ("Profiles + seeded slots", "Visible availability"),
            ("Book TX", "Slot reserved + appointment created"),
            ("Cancel TX", "Slot free again"),
            ("List filters", "date + status"),
            ("Authz", "Patients only book themselves"),
        ],
        ["Doctor schedule management UI", "Prescriptions", "Medical notes", "Admin global search"],
        ["FHIR/HL7", "SMS reminders", "Insurance claims"],
        [
            "No double-booking a slot.",
            "Cancel frees the slot in the same transaction.",
            "Patients cannot book for other users.",
        ],
    ),
    (
        "06-expense-split.md",
        "Expense Split",
        "expense-split",
        "A Splitwise-style app: groups, shared expenses with exact member shares, balances, settlements, optional recurring expenses and reports.",
        "Integer-cent invariants, aggregate balances, membership checks, settlement ledger.",
        {
            "Member": "Join group → add expense with shares → view balances → settle up with someone.",
            "Group admin": "Manage members; soft-delete expenses; configure recurring rules (Should).",
        },
        {
            "Groups": "Named groups with membership roles.",
            "Expenses & shares": "Shares must sum exactly to total cents.",
            "Balances": "Endpoint computing who owes whom.",
            "Settlements": "Record repayments (TX).",
            "Recurring/reports (Should)": "Rules that generate expenses; category breakdowns.",
        },
        [
            ("Groups + members", "Scoped access"),
            ("Expense + shares TX", "Exact sum enforced"),
            ("Balances API", "Matches sample scenarios"),
            ("Settlement", "Updates balances"),
            ("Filters", "date range + payer"),
        ],
        ["Recurring expenses", "Reports", "Soft-delete audit", "Owe/owed home dashboard"],
        ["Bank sync", "FX conversion engine", "PDF export as Must"],
        [
            "Share amounts must sum to expense total.",
            "Only members read/write group money data.",
            "Soft-deleted expenses excluded from balances unless admin audit view.",
        ],
    ),
    (
        "07-hotel-booking.md",
        "Hotel Booking Platform",
        "hotel-booking",
        "Guests search hotels/rooms by city and dates, book available rooms, cancel, and leave reviews. Managers manage inventory. Payments are mocked.",
        "Date-range overlap exclusion, availability search, mock payment row in the booking transaction.",
        {
            "Guest": "Search availability → pick room → book → see trips → review after stay (Should).",
            "Manager": "CRUD hotels/rooms → view occupancy dashboard (Should).",
        },
        {
            "Hotels & rooms": "City, capacity, price; soft-delete rooms.",
            "Availability": "Query rooms with no overlapping active booking for [checkIn, checkOut).",
            "Booking": "Creates booking + mock PaymentIntent in one TX; conflicts → 409.",
            "Reviews/calendar (Should)": "Ratings; simple availability grid.",
        },
        [
            ("Hotels/rooms seed", "Browsable inventory"),
            ("Availability API", "Respects overlaps"),
            ("Booking TX", "Mock payment row included"),
            ("Cancel path", "Defined status/soft-delete"),
            ("Filters", "city + q"),
        ],
        ["Calendar UI", "Reviews", "Occupancy dashboard", "Hide soft-deleted rooms"],
        ["Real Stripe", "Dynamic pricing ML", "OTA channel manager"],
        [
            "No overlapping active bookings for the same room.",
            "Booking + payment intent created together.",
            "Managers only mutate their hotels.",
        ],
    ),
    (
        "08-food-delivery.md",
        "Food Delivery Platform",
        "food-delivery",
        "Restaurants publish menus; customers cart items from a single restaurant and place orders that move through delivery statuses with a history trail. No live driver GPS required.",
        "Single-restaurant cart rule, place-order transaction, status state machine + history rows.",
        {
            "Customer": "Pick restaurant → add menu items → checkout order → watch status updates.",
            "Restaurant": "Manage menu → accept/progress orders → dashboard counts.",
        },
        {
            "Restaurants & menus": "Cuisine, items, prices, soft-delete items.",
            "Cart": "All lines must belong to one restaurant.",
            "Orders": "Snapshot lines; status placed→preparing→out_for_delivery→delivered|cancelled.",
            "Status history": "Each change appends DeliveryStatus.",
        },
        [
            ("Restaurant/menu CRUD", "Seeded menus"),
            ("Cart single-restaurant rule", "Cross-restaurant add fails"),
            ("Place order TX", "Clears cart"),
            ("Status updates", "Illegal edge → 400"),
            ("Order lists/filters", "By status"),
        ],
        ["Dashboards", "ETA field", "Customer timeline UI", "Cuisine search"],
        ["Live map tracking", "Driver app", "Real payments"],
        [
            "Cart cannot mix restaurants.",
            "Status transitions follow the documented one-way graph.",
            "Place order writes order+lines+first status+clears cart atomically.",
        ],
    ),
    (
        "09-cms-blogging.md",
        "CMS / Blogging Platform",
        "cms-blogging",
        "Authors write Markdown articles with revisions; editors publish a revision; readers view public posts and comment. Includes tags and SEO fields. Not a WordPress clone with plugins.",
        "Draft vs published lists, revision publish pointer transaction, tags, comments only on published posts.",
        {
            "Author": "Create article → save revisions in studio → request publish.",
            "Editor/Admin": "Publish a revision; manage tags.",
            "Reader": "Browse public blog → open slug → comment.",
        },
        {
            "Articles & revisions": "Body as Markdown textarea; metadata for SEO (Should).",
            "Publish": "Sets publishedRevisionId + publishedAt in one TX.",
            "Tags": "N:N labeling and filter.",
            "Comments": "Only when published.",
        },
        [
            ("Article/revision model", "Drafts exist"),
            ("Publish TX", "Public list only published"),
            ("Tags", "Filter works"),
            ("Comments on published", "Blocked on drafts"),
            ("Studio UI", "Create/edit draft"),
        ],
        ["SEO fields", "Editor dashboard", "Soft-delete", "Search q+tag"],
        ["Full WYSIWYG Must", "Scheduled publish cron as Must", "CDN image pipeline"],
        [
            "Public endpoints never return unpublished drafts.",
            "Publish updates pointer atomically.",
            "Authors edit own content unless editor/admin.",
        ],
    ),
    (
        "10-inventory-warehouse.md",
        "Inventory & Warehouse Management",
        "inventory-warehouse",
        "Operations software for stock across warehouses: on-hand levels, adjustment movements, inter-warehouse transfers, purchase orders, and low-stock reporting.",
        "Non-negative stock invariant, transfer double-entry transaction, movement audit trail.",
        {
            "Clerk": "Post adjustments (in/out/adjust) with reasons.",
            "Manager": "Create transfers and POs; receive POs into stock; view low-stock.",
        },
        {
            "Warehouses & products": "SKU unique; stock level per warehouse.",
            "Movements": "Every qty change has a movement row.",
            "Transfers": "Decrement source + increment destination + two movements in one TX.",
            "POs (Should)": "Draft → received updates stock.",
        },
        [
            ("Warehouses/products/levels", "Seeded stock"),
            ("Movements + negative guard", "Over-adjust → 400"),
            ("Movement list filters", "warehouse/SKU/date"),
            ("Authz by role", "Clerk vs manager"),
            ("Soft-delete products", "Hidden from new moves"),
        ],
        ["Transfers UI/API", "Purchase orders", "Low-stock report", "Manager dashboard"],
        ["Barcode hardware", "EDI suppliers", "Full WMS wave picking"],
        [
            "Quantity never goes below zero.",
            "Transfers are atomic across both warehouses.",
            "No silent stock edits without movements.",
        ],
    ),
    (
        "11-crm.md",
        "CRM System",
        "crm",
        "A sales CRM: leads become customers; deals move through a pipeline; notes and tasks keep follow-ups honest. Reporting is simple stage totals — not Salesforce.",
        "Pipeline stage edges, lead conversion transaction, task lists, board UI.",
        {
            "Rep": "Capture lead → convert to customer → create deal → log notes/tasks → advance stages.",
            "Sales lead": "Reassign ownership; view pipeline report.",
        },
        {
            "Leads": "Open/converted/archived.",
            "Conversion": "Creates customer and archives lead in one TX.",
            "Deals": "Stages with allowed transitions; amounts in cents.",
            "Notes & tasks": "Deal follow-ups with due dates.",
            "Pipeline (Should)": "Board + won-amount report.",
        },
        [
            ("Leads/customers/deals", "Seeded pipeline"),
            ("Stage machine", "Illegal → 400"),
            ("Convert TX", "Lead archived + customer created"),
            ("Notes + tasks", "Usable on deal page"),
            ("Filters", "stage/owner/q"),
        ],
        ["Pipeline board", "Reporting", "My tasks", "Soft-delete deals"],
        ["Email sync", "Forecast ML", "Calendar sync Must"],
        [
            "Only allowed stage transitions.",
            "Convert is atomic and idempotent (no double convert).",
            "Reps obey ownership rules you document.",
        ],
    ),
    (
        "12-support-desk.md",
        "Support Desk",
        "support-desk",
        "A Zendesk-like helpdesk: customers open tickets; agents assign and reply in threads; categories carry SLA targets; attachments and in-app notifications optional.",
        "Ticket+first-message transaction, status workflow, assignment, SLA due timestamps.",
        {
            "Customer": "Open ticket with first message → reply → see status.",
            "Agent": "Inbox → assign to self → reply → resolve/close.",
            "Admin": "Manage categories/SLA minutes.",
        },
        {
            "Tickets": "Category, requester, assignee, status open/pending/resolved/closed.",
            "Messages": "Thread; create ticket includes first message in one TX.",
            "SLA": "Compute firstResponseDueAt; show breach flag (Should).",
            "Notifications/attachments (Should)": "Simple table + URL/file stub.",
        },
        [
            ("Categories + tickets", "Customer can open"),
            ("Create TX", "Ticket+message together"),
            ("Threading", "Replies work"),
            ("Assign + statuses", "Illegal edge → 400"),
            ("Filters", "status/category/assignee"),
        ],
        ["SLA breach flag", "Attachments", "Notifications", "Agent inbox dashboard", "Soft-delete audit"],
        ["Email ingress", "Realtime presence", "Macro AI"],
        [
            "Ticket creation always includes first message atomically.",
            "Customers only access own tickets.",
            "Status transitions follow your documented graph.",
        ],
    ),
    (
        "13-property-rental.md",
        "Property Rental Platform",
        "property-rental",
        "Airbnb/rental lite: hosts list properties; renters favourite and request date ranges; host approval creates a lease and rejects conflicting requests; messaging supports questions.",
        "Overlap rejection, approve→lease transaction, favourites, dual dashboards.",
        {
            "Renter": "Search listings → favourite → request booking → message host → see trips.",
            "Host": "CRUD listings → approve/reject requests → see leases.",
        },
        {
            "Listings": "City, price, bedrooms; soft-delete.",
            "Booking requests": "Pending/approved/rejected with date range.",
            "Leases": "Created on approve; conflicts rejected.",
            "Messaging (Should)": "Thread per listing+renter.",
        },
        [
            ("Listings + search filters", "city/price/beds"),
            ("Favourites", "Toggle works"),
            ("Booking requests", "Create/list"),
            ("Overlap rules", "409 on conflict"),
            ("Approve TX", "Lease + reject siblings"),
        ],
        ["Messaging", "Host dashboard", "Renter trips", "Soft-delete listings"],
        ["E-sign docs", "Stripe rent collection", "Map provider Must"],
        [
            "No overlapping approved leases for a listing.",
            "Approve creates lease and rejects conflicting pendings atomically.",
            "Only hosts approve their listings’ requests.",
        ],
    ),
    (
        "14-event-management.md",
        "Event Management Platform",
        "event-management",
        "Organizers create events with capacity; attendees RSVP; overflow goes waitlist; cancellations promote waitlist and issue tickets; check-in consumes a ticket code.",
        "Capacity/waitlist, promote transaction, ticket codes, simple analytics.",
        {
            "Attendee": "RSVP yes/no/maybe → get ticket if yes and capacity allows → show ticket code.",
            "Organizer": "Create event → watch fill → check-in codes → view counts.",
        },
        {
            "Events": "Title, start, capacity; soft-delete.",
            "RSVP & waitlist": "At capacity, yes joins waitlist; cancel promotes.",
            "Tickets": "Issued for yes RSVPs; check-in once.",
            "Analytics (Should)": "Counts by RSVP/ticket/check-in.",
        },
        [
            ("Events CRUD", "Seeded events"),
            ("RSVP + capacity", "Waitlist when full"),
            ("Promote TX", "Cancel frees seat correctly"),
            ("Tickets", "Code visible to attendee"),
            ("Filters", "date + q"),
        ],
        ["Check-in endpoint/UI", "Analytics", "My events", "QR rendering library optional"],
        ["Hardware scanners", "Paid ticketing gateway", "Seat maps"],
        [
            "Capacity respected; overflow waitlisted.",
            "Cancel/promote/ticket issuance is one transaction.",
            "Tickets cannot be checked in twice.",
        ],
    ),
    (
        "15-fitness-tracker.md",
        "Fitness Tracker",
        "fitness-tracker",
        "Athletes log workouts with nested exercises and sets; personal records update when beats happen; plans/goals/charts are Should polish. Coaches may read assigned athletes.",
        "Nested create transaction, PR updates, ownership, history filters.",
        {
            "Athlete": "Log workout (exercises/sets) → see history/PRs → set goals/plans (Should).",
            "Coach": "Read-only view of athletes (Should).",
        },
        {
            "Workouts": "Nested exercise logs and sets created in one request/TX.",
            "PRs": "Updated when a set beats prior best for that exercise name.",
            "History": "Filter by date range and exercise.",
            "Plans/goals/charts (Should)": "Templates, targets, simple SVG/chart.",
        },
        [
            ("Nested workout TX", "All sets persisted or none"),
            ("PR updates", "Visible after beating set"),
            ("History + filters", "Works in UI"),
            ("Ownership", "Cannot edit others"),
            ("Soft-delete workouts", "Hidden from default lists"),
        ],
        ["Plans", "Goals", "Progress chart", "Coach read access", "Dashboard summary"],
        ["Wearable import", "Social feed", "AI plan generation Must"],
        [
            "Workout+logs+sets(+PR) write atomically.",
            "Athletes only mutate own workouts.",
            "PR comparison uses consistent exercise naming rules you document.",
        ],
    ),
    (
        "16-finance-tracker.md",
        "Finance Tracker",
        "finance-tracker",
        "Personal finance: accounts with balances, categorized transactions, monthly budgets, recurring rules, savings goals, and spend analytics. No real bank aggregation required.",
        "Balance-updating transaction, budgets vs spent, recurring generation, analytics queries.",
        {
            "Owner": "Create accounts → post transactions → see balance move → set budgets/goals → view category analytics.",
            "Advisor (Should)": "Read-only access if you implement linking.",
        },
        {
            "Accounts": "Named pots with balanceCents.",
            "Transactions": "Income/expense with category; posting updates balance in same TX.",
            "Budgets": "Per category/month with spent vs limit.",
            "Recurring/goals/analytics (Should)": "Generate txns; track savings; charts.",
        },
        [
            ("Accounts/categories/txns", "Seeded ledger"),
            ("Post TX updates balance", "curl proof"),
            ("Filters", "month/account/category"),
            ("Budgets", "Spent calculation correct"),
            ("Soft-delete txns", "Balances/budgets consistent"),
        ],
        ["Recurring runner", "Savings goals", "Analytics dashboard", "Account transfers double-entry", "Advisor read-only"],
        ["Plaid/bank sync", "Investment portfolios", "Tax filing"],
        [
            "Transaction sign matches type; balance updates in the same TX.",
            "Budgets ignore soft-deleted txns.",
            "Users only access their own finance data.",
        ],
    ),
    (
        "17-library-management.md",
        "Library Management",
        "library-management",
        "Campus/public library: catalog titles and copies, checkout/return, reservations when unavailable, overdue fines, and librarian tooling for inventory and overdues.",
        "Copy availability invariant, checkout/return transactions, reservation queue, loan limits, soft-delete catalog.",
        {
            "Member": "Search catalog → checkout available copy → reserve if none → return → see fines.",
            "Librarian": "Manage books/copies → checkout for members → process returns → clear overdues.",
            "Admin": "Suspend members / adjust loan limits (Should).",
        },
        {
            "Catalog": "Books + physical copies; soft-delete.",
            "Loans": "Checkout/return with copy status transitions in one TX.",
            "Reservations": "Queue when no available copy; cancel; promote on return (Should).",
            "Fines (Should)": "Created on overdue return; pay/clear.",
        },
        [
            ("Catalog + copies", "Seeded titles with ≥2 copies each"),
            ("Checkout TX", "Loan created; copy on_loan"),
            ("Return TX", "Copy freed; fine if overdue"),
            ("Loan limit + availability", "4xx on invariant breach"),
            ("Search + soft-delete", "title/author filters work"),
        ],
        ["Reservations + promote on return", "Fines pay flow", "Member dashboard", "Librarian overdue queue", "Admin suspend/limits"],
        ["Multi-branch transfers", "Email/SMS reminders", "Hardware barcode scanners"],
        [
            "A copy has at most one active loan; unavailable copies cannot be checked out.",
            "Members cannot exceed the active-loan limit.",
            "Checkout and return mutate loan + copy (+ fine) in one transaction.",
        ],
    ),
]


def expand_remaining(entry):
    (
        file,
        title,
        slug,
        what,
        why,
        journeys,
        features,
        must,
        should,
        out,
        rules,
    ) = entry
    # entity/api/routes/days/demo defaults tuned per slug via small maps
    extras = REMAINING_EXTRAS[slug]
    return (
        file,
        title,
        slug,
        dict(
            what=what,
            why=why,
            journeys=journeys,
            features=features,
            must=must,
            should=should,
            out=out,
            rules=rules,
            **extras,
        ),
    )


REMAINING_EXTRAS = {
    "lms": dict(
        entities=[
            ("Course", "Instructor offering"),
            ("Lesson", "Ordered content"),
            ("Enrollment", "Student join"),
            ("Quiz", "Assessment"),
            ("Question", "Quiz prompt"),
            ("Submission", "Student answers"),
            ("Grade", "Score"),
            ("Certificate", "Completion proof"),
        ],
        erd="""erDiagram
  User ||--o{ Course : teaches
  Course ||--o{ Lesson : contains
  Course ||--o{ Enrollment : has
  Course ||--o{ Quiz : includes
  Quiz ||--o{ Question : has
  Quiz ||--o{ Submission : receives
  Submission ||--o| Grade : scored
""",
        api=[
            ("CRUD", "/courses", "instructor", ""),
            ("CRUD", "/lessons", "instructor", ""),
            ("POST", "/courses/:id/enroll", "student", ""),
            ("POST", "/quizzes", "instructor", "TX"),
            ("POST", "/quizzes/:id/submissions", "student", ""),
            ("POST", "/submissions/:id/grade", "instructor", ""),
        ],
        routes=[("/courses", "Catalog"), ("/courses/[id]", "Detail/enroll"), ("/learn/[courseId]", "Lessons"), ("/instructor", "Teaching desk")],
        days=[
            ("1", "Course/lesson/enrollment", "Enroll works"),
            ("2", "Quiz/grade TX", "Due-date 400"),
            ("3", "Learn UI", "Student path"),
            ("4", "Grade UI", "Instructor path"),
            ("5", "Progress/certs", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="2 instructors, 3 courses with lessons, quizzes, enrollments, sample submissions.",
        demo=["Enroll → lesson → submit", "Grade submission", "Late submit 400", "Show certificate path if implemented"],
        pitfalls=["Duplicate enrollments", "Late submits accepted", "Students grading themselves"],
    ),
    "hospital-appointments": dict(
        entities=[
            ("DoctorProfile", "Clinician"),
            ("Slot", "Availability"),
            ("Appointment", "Booking"),
            ("Prescription", "Rx"),
            ("MedicalNote", "History"),
        ],
        erd="""erDiagram
  User ||--o| DoctorProfile : is
  DoctorProfile ||--o{ Slot : offers
  Slot ||--o| Appointment : books
  Appointment ||--o| Prescription : may_have
""",
        api=[
            ("CRUD", "/doctors", "doctor/admin", ""),
            ("CRUD", "/slots", "doctor", ""),
            ("POST", "/appointments", "patient", "TX book"),
            ("DELETE", "/appointments/:id", "patient", "TX cancel"),
            ("CRUD", "/notes", "doctor", "Should"),
            ("CRUD", "/prescriptions", "doctor", "Should"),
        ],
        routes=[("/doctors", "Directory"), ("/doctors/[id]", "Slots"), ("/appointments", "My bookings"), ("/doctor/schedule", "Manage slots")],
        days=[
            ("1", "Doctor/slot seed", "Free slots listed"),
            ("2", "Book/cancel TX", "Conflict 409"),
            ("3", "Booking UI", "Patient path"),
            ("4", "Schedule UI", "Doctor path"),
            ("5", "Notes/Rx", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="3 doctors, ≥30 slots, ≥5 appointments, sample notes/Rx optional.",
        demo=["Book slot", "Second book same slot 409", "Cancel frees slot", "Doctor adds note (Should)"],
        pitfalls=["Cancel without freeing slot", "Patients booking others", "Race without TX"],
    ),
    "expense-split": dict(
        entities=[
            ("Group", "Shared wallet space"),
            ("GroupMember", "Membership"),
            ("Expense", "Spend"),
            ("Share", "Split line"),
            ("Settlement", "Repayment"),
            ("RecurringRule", "Template"),
        ],
        erd="""erDiagram
  Group ||--o{ GroupMember : has
  Group ||--o{ Expense : contains
  Expense ||--o{ Share : splits
  Group ||--o{ Settlement : settles
""",
        api=[
            ("CRUD", "/groups", "auth", ""),
            ("POST", "/groups/:id/expenses", "member", "TX"),
            ("GET", "/groups/:id/balances", "member", ""),
            ("POST", "/groups/:id/settlements", "member", "TX"),
            ("CRUD", "/recurring", "group_admin", "Should"),
        ],
        routes=[("/groups", "My groups"), ("/groups/[id]", "Expenses/balances"), ("/groups/[id]/reports", "Should")],
        days=[
            ("1", "Group/expense schema", "Seed group"),
            ("2", "Shares+balances", "Sum validation"),
            ("3", "UI composer", "RTK draft shares"),
            ("4", "Settlements", "Balances move"),
            ("5", "Recurring/reports", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="2 groups, ≥4 members, ≥10 expenses, ≥2 settlements.",
        demo=["Add expense with valid shares", "Invalid sum → 400", "Show balances", "Settle between two members"],
        pitfalls=["Floating pennies", "Balances include deleted", "Non-member access"],
    ),
    "hotel-booking": dict(
        entities=[
            ("Hotel", "Property"),
            ("Room", "Bookable unit"),
            ("Booking", "Stay"),
            ("Review", "Rating"),
            ("PaymentIntent", "Mock pay"),
        ],
        erd="""erDiagram
  User ||--o{ Hotel : manages
  Hotel ||--o{ Room : has
  Room ||--o{ Booking : reserved
  Booking ||--o| PaymentIntent : pays
""",
        api=[
            ("CRUD", "/hotels", "manager", ""),
            ("CRUD", "/rooms", "manager", ""),
            ("GET", "/availability", "auth", "from/to"),
            ("POST", "/bookings", "guest", "TX"),
            ("POST", "/reviews", "guest", "Should"),
        ],
        routes=[("/hotels", "Search"), ("/hotels/[id]", "Rooms"), ("/bookings", "Trips"), ("/manager", "Ops")],
        days=[
            ("1", "Hotel/room seed", "List rooms"),
            ("2", "Overlap + book TX", "409 works"),
            ("3", "Search/book UI", "Guest path"),
            ("4", "Trips/cancel", "Defined UX"),
            ("5", "Reviews/calendar", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="3 hotels, ≥10 rooms, ≥6 bookings, sample reviews optional.",
        demo=["Search available rooms", "Book", "Overlapping book → 409", "Cancel", "Review (Should)"],
        pitfalls=["Date inclusivity bugs", "Bad overlap SQL", "Payment outside TX"],
    ),
    "food-delivery": dict(
        entities=[
            ("Restaurant", "Vendor"),
            ("MenuItem", "Food"),
            ("CartItem", "Line"),
            ("Order", "Checkout"),
            ("OrderLine", "Snapshot"),
            ("DeliveryStatus", "Timeline"),
        ],
        erd="""erDiagram
  User ||--o| Restaurant : owns
  Restaurant ||--o{ MenuItem : serves
  User ||--o{ Order : places
  Order ||--o{ OrderLine : lines
  Order ||--o{ DeliveryStatus : history
""",
        api=[
            ("CRUD", "/restaurants", "restaurant", ""),
            ("CRUD", "/menu-items", "restaurant", ""),
            ("CRUD", "/cart", "customer", ""),
            ("POST", "/orders", "customer", "TX"),
            ("PATCH", "/orders/:id/status", "restaurant", ""),
        ],
        routes=[("/restaurants", "Browse"), ("/restaurants/[id]", "Menu"), ("/cart", "Cart"), ("/orders", "Tracking"), ("/restaurant/dashboard", "Ops")],
        days=[
            ("1", "Restaurant/menu", "Seed menus"),
            ("2", "Cart rule + order TX", "Mixed cart fails"),
            ("3", "Browse/cart UI", "Customer path"),
            ("4", "Status UI", "Timeline"),
            ("5", "Dashboard", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="3 restaurants with menus, carts, orders in multiple statuses.",
        demo=["Add cart items", "Place order", "Advance status", "Illegal transition → 400"],
        pitfalls=["Mixed restaurant cart", "Skipping status edges", "No status history row"],
    ),
    "cms-blogging": dict(
        entities=[
            ("Article", "Post shell"),
            ("Revision", "Versioned body"),
            ("Tag", "Label"),
            ("ArticleTag", "M2M"),
            ("Comment", "Discussion"),
        ],
        erd="""erDiagram
  User ||--o{ Article : authors
  Article ||--o{ Revision : versions
  Article }o--o{ Tag : tagged
  Article ||--o{ Comment : receives
""",
        api=[
            ("CRUD", "/articles", "author/editor", ""),
            ("POST", "/articles/:id/revisions", "author", ""),
            ("POST", "/articles/:id/publish", "editor/author", "TX"),
            ("CRUD", "/tags", "editor", ""),
            ("POST", "/articles/:id/comments", "auth", "published only"),
        ],
        routes=[("/blog", "Public list"), ("/blog/[slug]", "Post"), ("/studio", "Drafts"), ("/studio/[id]", "Editor")],
        days=[
            ("1", "Article/revision", "Drafts exist"),
            ("2", "Publish TX + tags", "Public only published"),
            ("3", "Public blog UI", "Reader path"),
            ("4", "Studio", "RTK draft body"),
            ("5", "Comments/SEO", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="3 authors, 6 articles mix draft/published, tags, comments on published.",
        demo=["Create draft revision", "Publish", "Appears on /blog", "Comment", "Drafts not public"],
        pitfalls=["Draft leakage", "Publish without TX", "Comments on drafts"],
    ),
    "inventory-warehouse": dict(
        entities=[
            ("Warehouse", "Location"),
            ("Product", "SKU"),
            ("StockLevel", "On hand"),
            ("StockMovement", "Audit delta"),
            ("Transfer", "Move"),
            ("PurchaseOrder", "Inbound"),
        ],
        erd="""erDiagram
  Warehouse ||--o{ StockLevel : stores
  Product ||--o{ StockLevel : levels
  Transfer ||--o{ StockMovement : generates
  PurchaseOrder ||--o{ PurchaseOrderLine : lines
""",
        api=[
            ("CRUD", "/warehouses", "manager", ""),
            ("CRUD", "/products", "manager", ""),
            ("POST", "/movements", "clerk", "TX"),
            ("POST", "/transfers", "manager", "TX"),
            ("CRUD", "/purchase-orders", "manager", "Should"),
        ],
        routes=[("/warehouses", "Sites"), ("/products", "SKU list"), ("/movements", "Ledger"), ("/transfers", "Moves"), ("/purchase-orders", "POs")],
        days=[
            ("1", "Stock schema seed", "Levels visible"),
            ("2", "Movements + guard", "Negative 400"),
            ("3", "Stock UI", "Clerk path"),
            ("4", "Transfers", "Atomic move"),
            ("5", "POs/low-stock", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="2 warehouses, ≥10 products, levels, movements; optional PO.",
        demo=["Adjust stock", "Over-adjust → 400", "Transfer between warehouses", "Receive PO (Should)"],
        pitfalls=["Qty change without movement", "Non-atomic transfer", "Ignoring soft-deleted SKUs"],
    ),
    "crm": dict(
        entities=[
            ("Lead", "Prospect"),
            ("Customer", "Converted account"),
            ("Deal", "Opportunity"),
            ("Note", "Log"),
            ("Task", "Follow-up"),
        ],
        erd="""erDiagram
  User ||--o{ Lead : owns
  Lead ||--o| Customer : converts
  Customer ||--o{ Deal : has
  Deal ||--o{ Note : notes
  Deal ||--o{ Task : tasks
""",
        api=[
            ("CRUD", "/leads", "rep", ""),
            ("POST", "/leads/:id/convert", "rep", "TX"),
            ("CRUD", "/customers", "auth", ""),
            ("CRUD", "/deals", "auth", ""),
            ("CRUD", "/tasks", "auth", ""),
            ("CRUD", "/notes", "auth", ""),
            ("GET", "/reports/pipeline", "lead", "Should"),
        ],
        routes=[("/leads", "Inbox"), ("/customers", "Accounts"), ("/deals", "List"), ("/pipeline", "Board"), ("/tasks", "My tasks")],
        days=[
            ("1", "Lead/customer/deal", "Seed pipeline"),
            ("2", "Stages + convert TX", "Illegal 400"),
            ("3", "Lists UI", "Rep path"),
            ("4", "Pipeline board", "Should/Must UI"),
            ("5", "Tasks/reports", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="≥8 leads, ≥4 customers, ≥10 deals across stages, notes/tasks.",
        demo=["Convert lead", "Move deal stage", "Illegal stage → 400", "Complete a task"],
        pitfalls=["Double convert", "Stage skips", "Cross-owner edits without policy"],
    ),
    "support-desk": dict(
        entities=[
            ("Category", "Queue + SLA"),
            ("Ticket", "Case"),
            ("Message", "Thread line"),
            ("Attachment", "File meta"),
            ("Notification", "In-app ping"),
        ],
        erd="""erDiagram
  Category ||--o{ Ticket : classifies
  Ticket ||--o{ Message : thread
  Message ||--o{ Attachment : files
  Ticket ||--o{ Notification : alerts
""",
        api=[
            ("CRUD", "/categories", "admin", ""),
            ("POST", "/tickets", "customer", "TX"),
            ("GET", "/tickets", "auth", "filters"),
            ("POST", "/tickets/:id/messages", "auth", ""),
            ("PATCH", "/tickets/:id/assign", "agent", ""),
            ("GET", "/notifications", "auth", "Should"),
        ],
        routes=[("/tickets", "List"), ("/tickets/[id]", "Thread"), ("/agent", "Inbox"), ("/admin/categories", "Setup")],
        days=[
            ("1", "Category/ticket/message", "Open ticket"),
            ("2", "Create TX + statuses", "Edges enforced"),
            ("3", "Customer UI", "Open/reply"),
            ("4", "Agent inbox", "Assign/resolve"),
            ("5", "SLA/notify/files", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="≥3 categories, ≥10 tickets with messages; optional attachments/notifications.",
        demo=["Customer opens ticket", "Agent assigns and replies", "Resolve", "Show SLA breach example if implemented"],
        pitfalls=["Ticket without first message", "Customers seeing others’ tickets", "SLA never computed"],
    ),
    "property-rental": dict(
        entities=[
            ("Listing", "Property"),
            ("Favourite", "Saved"),
            ("BookingRequest", "Inquiry"),
            ("Lease", "Approved stay"),
            ("MessageThread", "Chat"),
            ("Message", "Chat line"),
        ],
        erd="""erDiagram
  User ||--o{ Listing : hosts
  Listing ||--o{ Favourite : faved
  Listing ||--o{ BookingRequest : requests
  BookingRequest ||--o| Lease : becomes
  MessageThread ||--o{ Message : has
""",
        api=[
            ("CRUD", "/listings", "host", ""),
            ("POST", "/favourites", "renter", ""),
            ("POST", "/booking-requests", "renter", ""),
            ("POST", "/booking-requests/:id/approve", "host", "TX"),
            ("POST", "/threads/:id/messages", "auth", "Should"),
        ],
        routes=[("/listings", "Search"), ("/listings/[id]", "Detail"), ("/favourites", "Saved"), ("/trips", "Renter"), ("/host", "Host desk")],
        days=[
            ("1", "Listing/favourite", "Search works"),
            ("2", "Requests + overlap", "409 conflicts"),
            ("3", "Renter UI", "Request flow"),
            ("4", "Approve/lease TX", "Siblings rejected"),
            ("5", "Messaging/dashboards", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="≥4 listings, favourites, ≥5 requests, ≥1 lease; optional thread.",
        demo=["Request booking", "Approve → lease", "Conflicting approve → 409", "Message host (Should)"],
        pitfalls=["Approving overlaps", "Not rejecting sibling requests", "Renters editing listings"],
    ),
    "event-management": dict(
        entities=[
            ("Event", "Gathering"),
            ("Rsvp", "Response"),
            ("Ticket", "Entry pass"),
            ("WaitlistEntry", "Overflow"),
            ("CheckIn", "Door scan"),
        ],
        erd="""erDiagram
  User ||--o{ Event : organizes
  Event ||--o{ Rsvp : receives
  Rsvp ||--o| Ticket : issues
  Event ||--o{ WaitlistEntry : waits
  Ticket ||--o| CheckIn : scans
""",
        api=[
            ("CRUD", "/events", "organizer", ""),
            ("POST", "/events/:id/rsvp", "attendee", ""),
            ("POST", "/tickets/:code/check-in", "organizer", "Should/Must polish"),
            ("GET", "/events/:id/analytics", "organizer", "Should"),
        ],
        routes=[("/events", "Discover"), ("/events/[id]", "RSVP"), ("/tickets", "My passes"), ("/organizer", "Ops")],
        days=[
            ("1", "Event/RSVP", "Seed events"),
            ("2", "Capacity/waitlist/promote TX", "Promote works"),
            ("3", "Event UI", "RSVP path"),
            ("4", "Tickets", "Codes shown"),
            ("5", "Check-in/analytics", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="≥3 events (at least one near capacity), RSVPs, waitlist entries, tickets.",
        demo=["Fill event → waitlist", "Cancel yes → promotion + ticket", "Check-in", "Analytics counts (Should)"],
        pitfalls=["Ignoring capacity", "Non-atomic promote", "Double check-in"],
    ),
    "fitness-tracker": dict(
        entities=[
            ("Workout", "Session"),
            ("ExerciseLog", "Movement"),
            ("Set", "Reps/weight"),
            ("PersonalRecord", "Best"),
            ("WorkoutPlan", "Template"),
            ("Goal", "Target"),
        ],
        erd="""erDiagram
  User ||--o{ Workout : logs
  Workout ||--o{ ExerciseLog : contains
  ExerciseLog ||--o{ Set : has
  User ||--o{ PersonalRecord : holds
""",
        api=[
            ("POST", "/workouts", "athlete", "TX"),
            ("GET", "/workouts", "athlete/coach", "filters"),
            ("GET", "/prs", "athlete", ""),
            ("CRUD", "/plans", "athlete", "Should"),
            ("CRUD", "/goals", "athlete", "Should"),
        ],
        routes=[("/workouts", "History"), ("/workouts/new", "Logger"), ("/prs", "Records"), ("/plans", "Plans"), ("/goals", "Goals")],
        days=[
            ("1", "Nested schema", "Models ready"),
            ("2", "Create TX + PRs", "PR updates"),
            ("3", "Logger UI", "RTK draft sets"),
            ("4", "History filters", "Date/exercise"),
            ("5", "Plans/goals/chart", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="2 athletes, ≥8 workouts, PR rows; optional plans/goals.",
        demo=["Log workout that beats a PR", "Filter history", "Show PR page", "Add goal (Should)"],
        pitfalls=["PR update outside TX", "Editing others’ workouts", "Empty charts with no data points"],
    ),
    "finance-tracker": dict(
        entities=[
            ("Account", "Wallet"),
            ("Category", "Bucket"),
            ("Transaction", "Ledger row"),
            ("Budget", "Monthly cap"),
            ("RecurringRule", "Schedule"),
            ("SavingsGoal", "Target"),
        ],
        erd="""erDiagram
  User ||--o{ Account : owns
  Account ||--o{ Transaction : posts
  Category ||--o{ Transaction : classifies
  User ||--o{ Budget : plans
""",
        api=[
            ("CRUD", "/accounts", "owner", ""),
            ("CRUD", "/transactions", "owner", "TX"),
            ("CRUD", "/budgets", "owner", ""),
            ("CRUD", "/recurring", "owner", "Should"),
            ("CRUD", "/goals", "owner", "Should"),
            ("GET", "/analytics", "owner", "Should"),
        ],
        routes=[("/accounts", "Accounts"), ("/transactions", "Ledger"), ("/budgets", "Budgets"), ("/goals", "Goals"), ("/analytics", "Charts")],
        days=[
            ("1", "Account/txn seed", "Balances set"),
            ("2", "Post TX + budgets", "Spent calc"),
            ("3", "Ledger UI", "Filters"),
            ("4", "Budgets UI", "Limit vs spent"),
            ("5", "Recurring/goals/analytics", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="≥3 accounts, categories, ≥20 transactions, ≥3 budgets; optional recurring/goals.",
        demo=["Post expense → balance drops", "Budget progress updates", "Run recurring (Should)", "Analytics by category (Should)"],
        pitfalls=["Balance update outside TX", "Budgets counting deleted txns", "Wrong income/expense signs"],
    ),
    "library-management": dict(
        entities=[
            ("Book", "Catalog title"),
            ("BookCopy", "Physical item"),
            ("Loan", "Checkout record"),
            ("Reservation", "Wait queue"),
            ("Fine", "Overdue charge"),
        ],
        erd="""erDiagram
  User ||--o{ Loan : borrows
  User ||--o{ Reservation : queues
  Book ||--o{ BookCopy : has
  BookCopy ||--o{ Loan : lent_as
  Book ||--o{ Reservation : reserved
  Loan ||--o| Fine : may_create
""",
        api=[
            ("CRUD", "/books", "librarian/admin", ""),
            ("CRUD", "/books/:id/copies", "librarian", ""),
            ("POST", "/loans/checkout", "librarian/member", "TX"),
            ("POST", "/loans/:id/return", "librarian/member", "TX"),
            ("CRUD", "/reservations", "member", ""),
            ("GET", "/fines", "member/librarian", "Should"),
            ("PATCH", "/fines/:id/pay", "librarian", "Should"),
        ],
        routes=[
            ("/books", "Catalog"),
            ("/books/[id]", "Detail + copies"),
            ("/my/loans", "Active loans"),
            ("/my/reservations", "Queue"),
            ("/librarian/overdue", "Overdues"),
        ],
        days=[
            ("1", "Book/copy/loan schema", "Seed catalog"),
            ("2", "Checkout/return TX", "Invariants hold"),
            ("3", "Catalog UI + search", "Filters"),
            ("4", "Reservations", "Should promote"),
            ("5", "Fines + dashboards", "Should"),
            ("6", "Demo", "PR"),
        ],
        seed="≥8 books, ≥2 copies each, ≥3 members with loans/reservations; optional fines.",
        demo=[
            "Checkout available copy",
            "Fail checkout when at loan limit or copy unavailable",
            "Return overdue → fine (Should)",
            "Reserve + promote on return (Should)",
        ],
        pitfalls=["Copy status updated outside TX", "Double-loaning same copy", "Reservations not cleared on checkout"],
    ),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    written = []

    # first three fully specified via add()
    for file, title, slug, kwargs in SPECS:
        text = page(title, slug, sectioned(**kwargs))
        (OUT / file).write_text(text)
        written.append((file, len(text)))

    for entry in REMAINING:
        file, title, slug, kwargs = expand_remaining(entry)
        text = page(title, slug, sectioned(**kwargs))
        (OUT / file).write_text(text)
        written.append((file, len(text)))

    index = ["# Project briefs\n", "Each brief is a full product + scope document. Implement on `<dev-name>/<slug>` in shared `apps/api/` + `apps/web/`.\n"]
    for file, _ in written:
        # title from file
        slug = file.split("-", 1)[1].replace(".md", "")
        index.append(f"- [{file}](./{file})")
    index.append("\nAlso: [grading](../grading.md) · [stack](../stack.md) · [submission](../submission.md)\n")
    (OUT / "README.md").write_text("\n".join(index) + "\n")

    for f, n in written:
        print(f"{f}: {n} chars")
    print(f"total files {len(written)}")


if __name__ == "__main__":
    main()
