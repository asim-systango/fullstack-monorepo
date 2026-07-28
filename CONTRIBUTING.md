# Contributing

- **Learners:** your domain in `apps/api` + UI in `apps/web`. Leave cookie auth on `apps/api-gateway` unless you must extend it.
- **Instructors:** shared libs, docs, tools, boilerplate.

## PRs

1. Branch `<dev-name>/<slug>`
2. Keep the diff scoped to your feature
3. `pnpm typecheck`, `pnpm lint`, `pnpm test` (CI also runs `lint:sonar`)
4. Demo steps in the PR body

## Commits

```text
feat(job-portal): add application status workflow
fix(auth): refresh session after register
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Ask an instructor before changing `libs/` — it affects everyone.
