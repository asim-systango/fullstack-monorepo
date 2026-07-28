# Submission

## What to implement

| Work       | Where                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| Domain API | `apps/api/src/modules/`                                                  |
| UI         | `apps/web/app/` (+ components)                                           |
| Auth       | Keep on `apps/api-gateway` (don’t move cookie login into the domain API) |

Browser calls **`/api` on `:3000`** (rewritten to the gateway). Don’t call `:3002` from the UI.

## Branch

`<dev-name>/<slug>` — example: `ada/job-portal`

```bash
git checkout -b ada/job-portal
```

## Before the PR

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. Commit `pnpm-lock.yaml` if you changed deps
5. `pnpm docker:db` · `pnpm migration:run` · `pnpm seed` (and your domain migrations)
6. `pnpm doctor` (optional but recommended)
7. Demo script in the PR body
8. Fill `docs/architecture.md`

## PR title

`feat(<slug>): <short summary>`  
Example: `feat(job-portal): add application status workflow`
