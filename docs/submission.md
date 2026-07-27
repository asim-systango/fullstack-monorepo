# Submission

## Ownership

Implement your assigned project (from the Google Sheet + `docs/projects/`) in this monorepo’s shared apps:

- Nest domain code → `apps/api/src/modules/`
- Next UI → `apps/web/app/` (and components)

Do not change other learners’ open PRs; coordinate on shared package changes with the instructor.

## Branch

Format: **`<dev-name>/<slug>`**

- `dev-name` — your name or handle (lowercase, hyphenated), e.g. `ada`
- `slug` — your assigned project id, e.g. `job-portal`

```bash
git checkout -b ada/job-portal
```

## Before you open a PR

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. If you changed dependencies, commit `pnpm-lock.yaml` (`pnpm install --frozen-lockfile` in CI)
5. Migrations + seed run clean (`pnpm docker:db`, `pnpm migration:run`, `pnpm seed`)
6. Demo script in the PR body
7. `docs/architecture.md` filled

## PR title

`feat(<slug>): <short summary>`

Example: `feat(job-portal): add application status workflow`

## Google Sheet

Instructor maintains the roster externally. Repo ships [`assignments.example.csv`](../assignments.example.csv) for column shape only.
