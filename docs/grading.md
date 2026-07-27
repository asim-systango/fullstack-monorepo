# Grading

| Tier        | Grade meaning                                       |
| ----------- | --------------------------------------------------- |
| **Must**    | Pass — required for a complete submission           |
| **Should**  | Distinction — expected from a strong 5–6 day effort |
| **Stretch** | Bonus — optional; may use mocks/fakes               |

## Must (all projects)

- [ ] Nest auth: register/login/logout, cookie JWT, ≥2 roles used meaningfully
- [ ] Distinct domain model (≥2 related entities) with reviewed migrations + seed
- [ ] List endpoint: pagination + ≥2 filters + soft-delete on the primary listable resource (or document intentional hard-delete in `docs/architecture.md`)
- [ ] One hard domain invariant enforced in service (+ DB constraint when possible)
- [ ] One multi-entity write in a transaction
- [ ] Next App Router: layout + list + create/detail flow
- [ ] Query for server data; RTK for drafts/filters/selection only
- [ ] `pnpm docker:db` Postgres works; `apps/api/.env` points at the shared DB
- [ ] Filled `docs/architecture.md` (ownership table + domain notes)
- [ ] Demo script in the PR body (≤5 minutes)

## Should

See each project brief — typically dashboards, workflows, attachments-as-URLs or local upload stubs, richer filters, and domain-specific status machines.

## Stretch

Payments, realtime tracking, QR hardware flows, full WYSIWYG, email providers, SLA engines — document an interface and fake provider if unfinished.
