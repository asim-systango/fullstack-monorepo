# Job Portal — 5-minute demo script (PR body)

Copy into the pull request description.

## Demo (≤5 minutes)

1. **Role tour** — Login `admin@demo.local` / `password123` → admin companies. Logout. Login `staff@demo.local` → staff dashboard. Logout. Login `user@demo.local` → jobs list.
2. **Company posts a job** — As staff: `/company/jobs/new` → create an OPEN job; confirm it appears on `/jobs`.
3. **Candidate applies** — As user: open the job → apply with cover letter (optional resume). Confirm under `/my/applications`.
4. **Double-apply rejected (409)** — Apply again to the same job → expect 409 Conflict.
5. **Status transitions** — As staff: `/company/applications` → move `submitted → reviewing`. Try illegal jump `submitted → hired` (or `reviewing → submitted`) → expect 400. Then `reviewing → hired` (or reject).
6. **Close-job transaction** — As staff: close the job → status `closed`; any remaining open applications become `rejected` in the same transaction.
7. **Admin suspend** — As admin: suspend that staff company → company's jobs vanish from public `/jobs`; open jobs force-closed to `closed`.
8. **Staff provisioning + forced password change** — As admin: `/admin/staff/new` → create staff (email + name) → copy one-time `tempPassword`. Logout. Login as new staff with temp password → redirected to `/change-password`. Call any other API while flagged → 403. Change password → land on staff home; flag cleared.
