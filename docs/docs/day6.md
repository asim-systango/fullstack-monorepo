# Hospital Appointment System

# DAY 06 — Full Integration, Testing, Security & Assessment Hardening

> Goal:
>
> Today we stop adding unnecessary features and make the existing Hospital
> Appointment System reliable, secure, testable, and ready for evaluation.
>
> Day 6 is an integration and hardening day.
>
> The implementation from Day 1–Day 5 must be reviewed as one complete system.
>
> Do not rewrite working functionality unnecessarily.
>
> Fix real defects, strengthen validation, improve UX, add tests, and verify
> every requirement from the original training brief.

---

# 1. Role

You are a Senior Full-Stack Engineer and Code Reviewer preparing a healthcare
appointment system for production-style evaluation.

Your job today is to:

- Review the existing implementation.
- Find missing requirements.
- Find security issues.
- Find authorization bugs.
- Find transaction/concurrency problems.
- Find frontend/backend inconsistencies.
- Add automated tests.
- Fix edge cases.
- Improve user experience.
- Verify the complete application end-to-end.

Do not claim something is complete unless it has been implemented and verified.

Do not add unrelated features just to make the project larger.

Correctness is more important than feature count.

---

# 2. Existing Project Context

The project contains:

## Backend

- NestJS
- PostgreSQL
- TypeORM
- JWT authentication
- Role-based authorization
- DTO validation
- Transactions
- Appointment booking
- Slot management
- Prescriptions
- Medical notes
- Appointment filtering
- Pagination
- Admin appointment search

## Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- ShadCN UI
- TanStack Query
- Redux Toolkit
- React Hook Form
- Zod
- Axios

---

# 3. Original Assessment Requirements

The original training requirement defines these MUST features:

- Doctor profiles + slots
- Patient booking
- Self-only patient booking
- Atomic slot reservation
- Cancellation frees the slot
- Appointment list
- Date filtering
- Status filtering
- Role enforcement
- Ownership enforcement
- Soft-deleted doctors
- Future slots deactivated
- Shared project Must bar

The required domain invariant is:

> No double-booking a slot.

The required transaction behavior is:

## Booking

```text
Lock slot
    ↓
Validate availability
    ↓
Create appointment
    ↓
Mark slot booked
    ↓
Commit
```

## Cancellation

```text
Validate ownership
    ↓
Cancel appointment
    ↓
Free slot
    ↓
Commit
```

Do not weaken these invariants.

---

# 4. Day 6 Primary Objectives

Complete all of the following:

- [ ] Backend integration review
- [ ] Frontend integration review
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests for critical workflows
- [ ] Authorization testing
- [ ] Transaction/concurrency testing
- [ ] Edge-case handling
- [ ] API consistency review
- [ ] Frontend UX hardening
- [ ] Error-state handling
- [ ] Loading-state handling
- [ ] Empty-state handling
- [ ] Security review
- [ ] Database constraint review
- [ ] Soft-delete verification
- [ ] Seed-data verification
- [ ] Swagger verification
- [ ] Final assessment checklist

---

# 5. IMPORTANT — Do Not Add New Major Features

Do NOT add:

- SMS
- Email notifications
- Insurance claims
- HL7/FHIR
- Video consultation
- Payment gateway
- AI features
- Chat
- Unrelated analytics

The training brief marks these as out of scope or stretch features.

Focus on passing the required system requirements.

---

# 6. Backend Audit

Review every backend module.

Expected modules:

```text
auth
doctors
slots
appointments
prescriptions
medical-notes
common
database
```

For each module verify:

- Controller
- Service
- DTOs
- Entity
- Repository/data access
- Validation
- Authorization
- Error handling
- Tests

Controllers must remain thin.

Business logic must remain in services.

Database operations must use the existing repository/data-access architecture.

---

# 7. Authentication Audit

Verify:

- Passwords are hashed.
- Passwords are never returned.
- JWT validation works.
- Expired access tokens are rejected.
- Refresh token flow works if implemented.
- Logout invalidates the refresh token if refresh-token invalidation is part
  of the current implementation.
- Protected endpoints reject unauthenticated requests.
- Public endpoints remain accessible.
- User identity is obtained from authentication context.

Never trust:

```text
userId
patientId
doctorId
role
```

from the client when these can be derived from the authenticated user.

---

# 8. RBAC Audit

Verify all roles:

```text
admin
staff / doctor
user / patient
```

The original requirement maps:

```text
admin  → admin
doctor → staff
patient → user
```

Do not accidentally introduce incompatible role names if the existing gateway
uses `admin`, `staff`, and `user`.

---

# 9. Authorization Matrix

Verify the following:

| Operation                                      | Patient | Doctor |                          Admin |
| ---------------------------------------------- | ------: | -----: | -----------------------------: |
| Browse doctors                                 |     YES |    YES |                            YES |
| View public doctor                             |     YES |    YES |                            YES |
| Book appointment                               |     YES |     NO |                             NO |
| Cancel own appointment                         |     YES |     NO |                             NO |
| Cancel another patient's appointment           |      NO |     NO |                             NO |
| View own appointments                          |     YES |     NO |                            YES |
| View own doctor's appointments                 |      NO |    YES |                            YES |
| Manage own slots                               |      NO |    YES |                            YES |
| Manage another doctor's slots                  |      NO |     NO |                            YES |
| Complete own appointment                       |      NO |    YES |   YES if current design allows |
| Create prescription for own visit              |      NO |    YES |   according to existing design |
| Create prescription for another doctor's visit |      NO |     NO | NO unless explicitly supported |
| Create medical note for own visit              |      NO |    YES |   according to existing design |
| Admin appointment search                       |      NO |     NO |                            YES |
| Manage doctor profiles                         |      NO |     NO |                            YES |

Do not grant permissions merely because a user is authenticated.

---

# 10. Patient Ownership Audit

This is critical.

A patient must only access their own appointments.

Correct backend behavior:

```text
currentUser.id
        ↓
appointment.patientId
        ↓
must match
```

Never do:

```text
GET /appointments?patientId=123
```

and assume the frontend will prevent misuse.

The backend must enforce ownership.

---

# 11. Doctor Ownership Audit

A doctor must only access appointments associated with their own slots.

Resolve:

```text
currentUser
    ↓
DoctorProfile
    ↓
Slot
    ↓
Appointment
```

Do not trust:

```text
doctorId
```

from the request body.

---

# 12. Critical Test #1 — Double Booking

This is one of the most important assessment tests.

Create:

```text
Patient A
Patient B
Slot X
```

Send two booking requests against Slot X concurrently.

Expected:

```text
Patient A → success
Patient B → 409 Conflict
```

OR the reverse.

Exactly one appointment must be created.

The slot must end as:

```text
booked
```

There must never be:

```text
2 scheduled appointments
```

for one slot.

---

# 13. Critical Test #2 — Unauthorized Cancellation

Create:

```text
Patient A → Appointment A
Patient B → Appointment B
```

Login as Patient B.

Attempt:

```text
DELETE /appointments/{Appointment A}
```

Expected:

```text
403 Forbidden
```

or the project's approved equivalent.

Appointment A must remain unchanged.

Slot A must remain booked.

---

# 14. Critical Test #3 — Patient Cannot Book For Another User

Attempt to submit:

```json
{
  "slotId": "...",
  "patientId": "another-user-id"
}
```

The backend must ignore or reject the supplied patient ID.

The appointment must always use:

```text
authenticatedUser.id
```

Expected result:

```text
appointment.patientId === authenticatedUser.id
```

---

# 15. Critical Test #4 — Cancel Frees Slot

Flow:

```text
Available Slot
    ↓
Book
    ↓
Slot = booked
    ↓
Cancel
    ↓
Appointment = cancelled
    ↓
Slot = available
```

Verify both records.

Do not verify only the appointment.

---

# 16. Critical Test #5 — Cancellation Is Atomic

Force an error during cancellation.

Verify:

```text
appointment
slot
```

do not end in an inconsistent state.

If cancellation fails:

```text
appointment remains scheduled
slot remains booked
```

OR the transaction rolls back completely.

Never allow:

```text
appointment = cancelled
slot = booked
```

or:

```text
appointment = scheduled
slot = available
```

unless that state is explicitly supported.

---

# 17. Critical Test #6 — Booking Is Atomic

Force an error while creating the appointment after the slot has been locked.

Verify the slot returns to its previous state.

The transaction must rollback.

---

# 18. Past Slot Test

Attempt to book a slot whose:

```text
startsAt < current time
```

Expected:

```text
400 Bad Request
```

or the project's approved business-rule status.

Past slots must never become bookable.

---

# 19. Blocked Slot Test

Attempt to book:

```text
slot.status = blocked
```

Expected:

```text
409 Conflict
```

or the project's approved business-rule status.

The appointment must not be created.

---

# 20. Already Booked Slot Test

Attempt:

```text
book Slot X
book Slot X again
```

Expected:

```text
first → success
second → 409 Conflict
```

---

# 21. Already Cancelled Appointment

Attempt to cancel an already cancelled appointment.

Expected:

```text
400 Bad Request
```

or the project's approved business-rule status.

Do not silently succeed unless the project explicitly chooses idempotent cancellation.

Follow the existing assessment requirement.

---

# 22. Completed Appointment

Verify:

```text
completed
```

appointments cannot be cancelled.

They cannot be moved back to:

```text
scheduled
```

They cannot be moved back to:

```text
cancelled
```

---

# 23. Appointment State Machine

The only valid transitions are:

```text
scheduled
    ├──→ completed
    │
    └──→ cancelled
```

Invalid:

```text
completed → scheduled
completed → cancelled
cancelled → scheduled
cancelled → completed
```

Create tests for every invalid transition.

---

# 24. Prescription Tests

Verify:

### Allowed

```text
completed appointment
+
authorized doctor
=
prescription allowed
```

### Rejected

```text
scheduled appointment
```

```text
cancelled appointment
```

```text
another doctor's appointment
```

```text
non-existent appointment
```

Do not allow prescriptions to bypass appointment ownership.

---

# 25. Medical Note Tests

Verify:

- Doctor can create a note for an authorized appointment.
- Doctor cannot create a note for another doctor's appointment.
- Patient cannot access internal-only doctor notes.
- Unauthorized users cannot access notes.
- Doctor identity is derived from authenticated user.

---

# 26. Appointment Filtering Tests

The required filters are:

```text
status
dateFrom
dateTo
```

Test:

```text
scheduled
cancelled
completed
```

Test:

```text
dateFrom only
dateTo only
dateFrom + dateTo
```

Test:

```text
dateFrom > dateTo
```

Expected:

```text
validation/business error
```

---

# 27. Pagination Tests

Verify:

```text
page=1
limit=10
```

and:

```text
page=2
limit=10
```

Ensure records do not overlap incorrectly.

Verify:

```text
totalItems
totalPages
page
limit
```

are correct.

Limit must have a safe maximum.

Do not allow:

```text
limit=1000000
```

---

# 28. Admin Search Tests

Admin can:

- Search appointments.
- Filter by doctor.
- Filter by patient.
- Filter by status.
- Filter by date.
- Paginate.

Non-admin users must receive:

```text
403 Forbidden
```

---

# 29. Doctor Soft Delete Verification

This is a MUST requirement.

When an admin soft-deletes a doctor:

```text
DoctorProfile.deletedAt != null
```

The doctor must:

- disappear from public directory
- disappear from public search
- no longer be bookable

Future slots must be deactivated.

For example:

```text
future available slot
        ↓
doctor soft deleted
        ↓
slot becomes blocked / inactive
```

Do not allow patients to book those slots.

---

# 30. Soft Delete Audit

Verify that soft-deleted doctors do not appear in normal queries.

Admin may still see the doctor in an administrative/trash view if the existing
implementation supports it.

Do not physically delete the doctor if the assessment requires soft deletion.

---

# 31. Database Constraint Audit

Review the database.

Required constraints include:

```text
UNIQUE(doctor_profiles.userId)
```

and:

```text
UNIQUE(appointments.slotId)
WHERE status = 'scheduled'
```

or the equivalent database strategy required by the current implementation.

Also verify:

```text
CHECK slots.endsAt > slots.startsAt
```

The database must enforce critical invariants where practical.

Do not rely only on application-level checks for concurrency-sensitive rules.

---

# 32. Index Audit

Verify useful indexes exist for:

```text
doctor_profiles.userId
doctor_profiles.specialization

slots.doctorId
slots.startsAt
slots.status

appointments.patientId
appointments.slotId
appointments.status
```

Review whether composite indexes are justified.

Do not create dozens of unnecessary indexes.

---

# 33. Transaction Audit

Review booking and cancellation code manually.

Ensure:

- Transaction begins before critical state changes.
- Slot is locked before availability decision.
- Appointment and slot updates occur in the same transaction.
- Errors cause rollback.
- Transaction resources are released correctly.
- No database operation accidentally occurs outside the transaction.
- No transaction is unnecessarily held during external network calls.

---

# 34. Concurrency Audit

Review the implementation for race conditions.

The system must protect:

```text
same slot
+
multiple simultaneous booking requests
```

Preferred approach:

```text
database-level locking
+
unique database constraint
+
transaction
```

Do not rely only on:

```text
if (slot.status === available)
```

because two requests can read the same value concurrently.

---

# 35. Frontend Error Handling

Every important API error must produce useful UI.

Handle:

```text
400
401
403
404
409
422
500
```

Examples:

```text
409 → "This slot was just booked by another patient."
403 → "You do not have permission to perform this action."
404 → "The appointment could not be found."
500 → "Something went wrong. Please try again."
```

Do not expose raw database errors to users.

---

# 36. Frontend Loading States

Every async page must have an intentional loading state.

Required:

```text
Doctor list
Doctor details
Slots
Appointments
Appointment details
Admin appointments
Prescription
Medical notes
```

Use:

- Skeleton
- Spinner
- Disabled submit button
- Loading indicators

Never show stale or incorrect empty state while data is loading.

---

# 37. Frontend Empty States

Create useful empty states.

Examples:

```text
No appointments found.
Try changing your filters.
```

```text
No available slots for this date.
Choose another date.
```

```text
No doctors found.
```

Provide appropriate actions:

```text
Clear filters
Choose another date
Go back
```

---

# 38. Frontend Role-Based Navigation

Verify:

## Patient

```text
Doctors
Appointments
Profile
```

## Doctor

```text
Schedule
Appointments
Profile
```

## Admin

```text
Doctors
Appointments
Users
Settings
```

Do not display irrelevant navigation.

But remember:

> Hiding a menu item is UX, not security.

The backend must still enforce authorization.

---

# 39. Protected Route Verification

Verify:

```text
/appointments
/doctor/*
/admin/*
```

cannot be accessed without authentication.

Verify role restrictions.

Examples:

```text
patient → /doctor/schedule → 403/access denied
patient → /admin/appointments → 403/access denied
doctor → /admin/appointments → 403/access denied
```

---

# 40. Authentication Persistence

Verify:

1. Login.
2. Refresh browser.
3. User remains authenticated.
4. Protected page loads correctly.
5. Expired access token triggers refresh flow if implemented.
6. Invalid refresh token logs the user out safely.

---

# 41. Frontend Query Cache Audit

Review TanStack Query keys.

After booking:

```text
available slots
appointments
doctor details
```

should be invalidated/refreshed appropriately.

After cancellation:

```text
appointments
available slots
appointment detail
```

should update.

After completing appointment:

```text
appointment list
appointment detail
doctor appointment list
```

should update.

Avoid full page reloads.

---

# 42. Form Validation Audit

Every important form must validate:

```text
Login
Register
Slot creation
Appointment booking
Prescription
Medical note
Filters
```

Frontend validation:

```text
Zod
```

Backend validation:

```text
class-validator
```

Frontend validation must never replace backend validation.

---

# 43. API Contract Audit

Compare:

```text
Backend DTO
Backend response
Frontend TypeScript type
Frontend API service
Frontend UI
```

They must agree.

Look specifically for:

- snake_case vs camelCase
- enum mismatch
- nullable fields
- date formats
- pagination structure
- error structure
- status values

Fix inconsistencies rather than adding frontend hacks.

---

# 44. Date and Time Audit

The project requires:

```text
UTC timestamptz
```

for slot start/end times.

Verify:

- Backend stores UTC.
- APIs serialize dates consistently.
- Frontend converts dates for display.
- Filtering uses correct timezone boundaries.
- Past-slot checks are timezone-safe.

Do not compare local strings manually.

Use proper date/time handling.

---

# 45. API Response Audit

Maintain the project's consistent response structure.

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

Do not expose:

```text
stack traces
SQL errors
database schema details
passwords
tokens
```

in production-facing responses.

---

# 46. Security Review

Review:

- Password hashing
- JWT validation
- Role guards
- Ownership checks
- DTO validation
- SQL injection protection
- Sensitive response fields
- CORS
- Environment variables
- Error responses
- Rate limiting if already supported
- Swagger exposure strategy
- Debug logging

Never commit:

```text
.env
JWT secrets
database passwords
API keys
refresh tokens
```

---

# 47. Environment Variables

Verify separate configuration exists for:

```text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
API_URL
NEXT_PUBLIC_API_URL
```

Use environment variables rather than hard-coded secrets.

Provide:

```text
.env.example
```

with placeholder values only.

---

# 48. Docker Verification

Run the complete system through Docker.

Verify:

```text
PostgreSQL
Redis if used
Backend
Frontend
```

all start correctly according to the current project architecture.

Do not introduce unnecessary Docker services.

---

# 49. Migration Verification

Test from a clean database.

Process:

```text
drop database
    ↓
create database
    ↓
run migrations
    ↓
run seed
    ↓
start backend
    ↓
start frontend
```

The project must work from a fresh database.

Do not depend on:

```text
synchronize: true
```

---

# 50. Seed Verification

Seed must contain enough realistic data to demonstrate:

```text
3 doctors
multiple patients
available slots
booked slots
blocked slots
scheduled appointments
cancelled appointments
completed appointments
prescriptions
medical notes
```

Ensure all relationships are valid.

Do not create orphaned records.

---

# 51. Test Categories

Implement or improve:

## Unit Tests

Test:

- Services
- Business rules
- State transitions
- Validation logic

## Integration Tests

Test:

- Database
- Repositories
- Transactions
- Constraints

## E2E Tests

Test:

- Authentication
- Booking
- Cancellation
- Filtering
- Authorization
- Prescription workflow
- Admin search

---

# 52. Minimum E2E Scenario

Run this complete flow:

```text
Register Patient
        ↓
Login
        ↓
Browse Doctors
        ↓
Open Doctor
        ↓
View Available Slot
        ↓
Book Slot
        ↓
View Appointment
        ↓
Cancel Appointment
        ↓
Verify Slot Available Again
```

---

# 53. Doctor E2E Scenario

```text
Login Doctor
        ↓
View Schedule
        ↓
View Appointments
        ↓
Complete Appointment
        ↓
Create Prescription
        ↓
Create Medical Note
        ↓
Verify Unauthorized Data Is Not Accessible
```

---

# 54. Admin E2E Scenario

```text
Login Admin
        ↓
View Doctors
        ↓
Soft Delete Doctor
        ↓
Verify Doctor Removed From Public Directory
        ↓
Verify Future Slots Deactivated
        ↓
Search Hospital Appointments
        ↓
Filter By Status
        ↓
Filter By Doctor
        ↓
Filter By Date
```

---

# 55. Negative E2E Scenario

Verify:

```text
Patient A books Slot X
        ↓
Patient B books Slot X
        ↓
Patient B receives 409
```

Then:

```text
Patient B tries to cancel Patient A appointment
        ↓
403
```

Then:

```text
Patient tries doctor route
        ↓
403
```

Then:

```text
Doctor tries admin route
        ↓
403
```

---

# 56. UI Quality Review

Review all pages for:

- Responsive layout
- Consistent spacing
- Typography
- Buttons
- Forms
- Tables
- Cards
- Dialogs
- Badges
- Navigation
- Error messages
- Loading states
- Empty states

Use the existing shared UI system.

Do not create duplicate components unnecessarily.

---

# 57. Accessibility Review

Verify:

- Buttons have accessible names.
- Form inputs have labels.
- Dialogs are keyboard accessible.
- Focus states are visible.
- Error messages are associated with inputs.
- Color is not the only indication of status.
- Tables remain usable.
- Keyboard navigation works.

---

# 58. Performance Review

Check:

- Appointment queries are paginated.
- Doctor lists are paginated if required.
- No N+1 queries.
- No unnecessary API requests.
- TanStack Query caching is used correctly.
- Frontend does not refetch excessively.
- Database indexes support common filters.
- Large datasets do not get loaded entirely.

Do not optimize blindly.

Measure or inspect query behavior before adding complexity.

---

# 59. Code Quality Review

Run:

```bash
pnpm lint
pnpm build
pnpm test
```

Use the project's actual package scripts if they differ.

Fix:

- TypeScript errors
- ESLint errors
- Unused imports
- Dead code
- Debug console logs
- Incorrect types
- Missing error handling
- Duplicate logic
- Unnecessary comments
- TODOs that belong to completed scope

---

# 60. Swagger Review

Swagger must correctly expose:

```text
Authentication
Doctors
Slots
Appointments
Prescriptions
Medical Notes
Admin Search
```

Verify:

- Request schemas
- Response schemas
- Authentication requirements
- Role requirements
- Error responses

Test important endpoints directly through Swagger.

---

# 61. Database Integrity Verification

Run checks for:

```text
orphan appointments
orphan slots
appointments without slots
appointments pointing to deleted doctors
invalid slot times
duplicate scheduled appointments
```

There must never be two scheduled appointments for the same slot.

---

# 62. Final Must Requirements Checklist

Before completing Day 6, verify every item.

```text
[ ] Doctor profiles exist
[ ] Slots exist
[ ] Slots expose availability correctly
[ ] Patient can book available slot
[ ] Patient can only book for self
[ ] Double booking returns 409
[ ] Booking is transactional
[ ] Patient can cancel own appointment
[ ] Patient cannot cancel another patient's appointment
[ ] Cancellation returns appropriate 4xx for unauthorized access
[ ] Cancellation frees slot
[ ] Cancellation is transactional
[ ] Appointment list exists
[ ] Appointment filtering by status works
[ ] Appointment filtering by date range works
[ ] Role enforcement works
[ ] Doctor sees own appointments only
[ ] Soft-deleted doctor disappears publicly
[ ] Future slots become unavailable after doctor deletion
```

---

# 63. Should Requirements Checklist

```text
[ ] Doctor schedule management
[ ] Doctor can create slots
[ ] Doctor can block slots
[ ] Doctor can manage unused slots
[ ] Prescriptions
[ ] Medical notes
[ ] Admin appointment search
```

---

# 64. Edge Case Checklist

Verify:

```text
[ ] Book cancelled slot
[ ] Book blocked slot
[ ] Book past slot
[ ] Book already booked slot
[ ] Cancel already cancelled appointment
[ ] Cancel completed appointment
[ ] Complete cancelled appointment
[ ] Complete completed appointment
[ ] Prescription for scheduled appointment
[ ] Prescription for cancelled appointment
[ ] Prescription for another doctor's appointment
[ ] Patient access to another patient's appointment
[ ] Doctor access to another doctor's appointment
[ ] Non-admin access to admin endpoint
[ ] Invalid date range
[ ] Invalid pagination
[ ] Missing required fields
[ ] Invalid enum values
[ ] Non-existent IDs
```

---

# 65. Assessment Demo Preparation

Create:

```text
docs/DEMO.md
```

Prepare a 5-minute demo.

---

## Demo Part 1 — Roles

Show:

```text
Doctor login
Patient login
Admin login
```

Demonstrate different navigation and permissions.

---

## Demo Part 2 — Happy Path

```text
Patient
    ↓
Doctor directory
    ↓
Select doctor
    ↓
Select available slot
    ↓
Book
    ↓
Appointment appears
```

---

## Demo Part 3 — Cancellation

```text
Cancel appointment
    ↓
Appointment disappears from upcoming list
    ↓
Slot becomes available
```

---

## Demo Part 4 — Double Booking

Use two patient accounts.

```text
Patient A → Slot X
Patient B → Slot X
```

Show:

```text
Patient A → success
Patient B → 409 Conflict
```

This directly demonstrates the hard invariant.

---

## Demo Part 5 — Authorization

Show:

```text
Patient tries another patient's appointment
```

Expected:

```text
403 / 404 according to the project's approved ownership behavior
```

Then:

```text
Doctor tries admin route
```

Expected:

```text
403
```

---

## Demo Part 6 — Filtering

Show:

```text
status = completed
date range
```

Then clear filters.

---

## Demo Part 7 — Doctor Workflow

```text
Doctor
    ↓
View appointment
    ↓
Complete visit
    ↓
Add prescription
    ↓
Add medical note
```

---

# 66. Create Final Verification Script

Create:

```text
scripts/verify-assessment.*
```

Use the project's appropriate scripting language.

The script should help verify:

- API availability
- Database availability
- migrations
- seed state
- basic authentication
- required endpoints

Do not create a fake verification script that simply returns success.

It must perform meaningful checks.

---

# 67. Documentation Updates

Update:

```text
docs/PRD.md
docs/ARCHITECTURE.md
docs/ERD.md
docs/DATABASE_DESIGN.md
docs/API_CONTRACT.md
docs/AUTHENTICATION.md
docs/RBAC.md
docs/TESTING_STRATEGY.md
docs/SETUP_GUIDE.md
docs/DEMO.md
```

Document actual implementation.

Do not document features that do not exist.

If an earlier document contains assumptions that changed during implementation,
update it to match the actual project.

---

# 68. Final Architecture Review

Review the entire system:

```text
Next.js
   ↓
Axios
   ↓
NestJS
   ↓
Guards
   ↓
Controllers
   ↓
Services
   ↓
Repositories / Data Access
   ↓
PostgreSQL
```

Verify authentication:

```text
Login
   ↓
JWT
   ↓
Guard
   ↓
Current User
   ↓
Role Guard
   ↓
Controller
```

Verify booking:

```text
Patient
   ↓
POST /appointments
   ↓
JWT identity
   ↓
Ownership
   ↓
Transaction
   ↓
Lock slot
   ↓
Validate
   ↓
Create appointment
   ↓
Book slot
   ↓
Commit
```

---

# 69. Final Build Verification

Perform a clean verification.

Backend:

```bash
pnpm lint
pnpm build
pnpm test
```

Frontend:

```bash
pnpm lint
pnpm build
```

Use the actual repository scripts when names differ.

Then verify:

```text
Docker starts
Database starts
Migrations work
Seed works
Backend starts
Frontend starts
Swagger works
Authentication works
Booking works
Cancellation works
Filtering works
Doctor workflow works
Admin workflow works
```

---

# 70. Git Review

Before committing:

```bash
git status
```

Review all changes.

Do not commit:

```text
.env
node_modules
.next
dist
coverage
debug files
temporary files
```

Review:

```text
git diff
```

Commit with a meaningful message.

Suggested:

```bash
git add .
git commit -m "feat: harden hospital appointment workflows"
```

Do not force push.

Do not rewrite unrelated history.

---

# 71. Day 6 Definition of Done

Day 6 is complete only when:

```text
[ ] All MUST requirements verified
[ ] All important SHOULD requirements verified
[ ] Critical negative scenarios tested
[ ] Double-booking tested
[ ] Ownership tested
[ ] RBAC tested
[ ] Transactions reviewed
[ ] Soft delete verified
[ ] Filtering verified
[ ] Pagination verified
[ ] Prescription workflow verified
[ ] Medical note workflow verified
[ ] Admin search verified
[ ] Frontend error states verified
[ ] Frontend loading states verified
[ ] Frontend empty states verified
[ ] API contracts verified
[ ] Database constraints verified
[ ] Swagger verified
[ ] Unit tests pass
[ ] Integration tests pass
[ ] E2E tests pass
[ ] Backend builds
[ ] Frontend builds
[ ] Lint passes
[ ] Docker works
[ ] Seed works
[ ] Documentation updated
[ ] Demo script prepared
```

---

# 72. Final Output From Codex

After completing Day 6, provide a concise engineering report.

Use exactly this structure:

## Summary

What was reviewed and improved.

## Requirements Verified

List every MUST requirement and its verification status.

## Tests Added

List unit, integration, and E2E tests.

## Security Fixes

List authentication, authorization, ownership, and data exposure fixes.

## Database Fixes

List constraints, indexes, migrations, and transaction improvements.

## Frontend Fixes

List UX, loading, error, empty state, and API integration improvements.

## Files Changed

List important files.

## Commands Verified

List commands that successfully passed.

## Remaining Issues

Only list genuine remaining issues.

Do not claim zero issues unless the application was actually verified.

---

# DAY 6 PRINCIPLE

The goal is NOT:

"Add more features."

The goal is:

"Make the features we already built correct."

The system must be:

```text
Correct
Secure
Transactional
Tested
Consistent
Usable
Maintainable
Demo-ready
```

Do not sacrifice correctness for speed.

Do not bypass database constraints.

Do not bypass authorization.

Do not trust client-controlled ownership fields.

Do not remove tests to make builds pass.

Do not hide errors.

Do not claim success without verification.

Finish Day 6 with a system that can survive the training team's negative tests,
not just the happy path.
