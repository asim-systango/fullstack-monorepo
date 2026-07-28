# Grading

| Tier        | Meaning              |
| ----------- | -------------------- |
| **Must**    | Required to pass     |
| **Should**  | Strong / distinction |
| **Stretch** | Bonus (mocks OK)     |

## Must (every project)

- [ ] Auth on the **gateway**: register / login / logout, cookie JWT, ≥2 roles used meaningfully
- [ ] Domain model (≥2 related entities) with migrations + seed
- [ ] List endpoint: pagination + ≥2 filters + soft-delete on the main list resource
- [ ] One hard domain invariant in a service (+ DB constraint when possible)
- [ ] One multi-entity write in a transaction
- [ ] Next: layout + list + create/detail
- [ ] Query for server data; RTK for drafts/filters only
- [ ] `pnpm docker:db` works; gateway + api share `DATABASE_URL` and `JWT_SECRET`
- [ ] `docs/architecture.md` filled (ownership + domain notes)
- [ ] Demo script in the PR (≤5 minutes)

## Should

See your project brief (dashboards, workflows, richer filters, etc.).

## Stretch

Optional extras in the brief — or an extra Nest app ([adding-a-service.md](./adding-a-service.md)). Must still pass on web + gateway + api alone.
