# Contributing

## Code ownership

- Learners: implement your assigned project in `apps/api/` and `apps/web/` on your own branch
- Instructors: shared libs, docs, tools, boilerplate

## Pull requests

1. Branch `<dev-name>/<slug>` (example: `ada/job-portal`)
2. Keep diffs scoped to your feature work (+ docs only if asked)
3. Ensure `pnpm typecheck` and `pnpm lint` pass
4. Describe demo steps in the PR body

## Commit messages

```text
feat(job-portal): add application status workflow
fix(auth): refresh session after register
chore: add husky and commitlint
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Shared code

Prefer extending domain code in `apps/api/` and `apps/web/`. Changes under `libs/` affect every learner — get instructor review first.
