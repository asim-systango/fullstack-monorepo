# Contributing

- **Learners:** your domain in `apps/api` + UI in `apps/web`. Prefer `@shared/ui/components` (theme via `@shared/ui/theme.css`; gallery `/ui`) — [frontend.md](docs/frontend.md). Leave cookie auth on `apps/api-gateway` unless you must extend it.
- **Instructors:** shared libs, docs, tools, boilerplate.
- Local stack: copy the four env examples (see root README), then `pnpm docker:db && pnpm dev` and `pnpm doctor`.

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

Keep `libs/` changes scoped and intentional — they affect every app. Prefer using `@shared/ui/components` in pages over forking shared packages.

## Git hooks (Husky)

| Hook         | What runs                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged` → ESLint (SonarJS + jsx-a11y, typed) + **stylelint** on CSS + Prettier on staged files |
| `commit-msg` | Conventional Commits via commitlint                                                                  |
| `pre-push`   | `pnpm lint:sonar` (ESLint + stylelint on whole tree)                                                 |

**Trace quality issues in one shot**

```bash
pnpm lint:sonar   # TS/TSX (eslint-plugin-sonarjs + jsx-a11y) AND CSS (stylelint ≈ Sonar CSS)
pnpm lint:all     # turbo package lint + lint:sonar
```

SonarLint in the IDE can still show extra rules that need a SonarQube/Cloud connection. Prefer fixing what `pnpm lint:sonar` reports — that is the commit/push gate. Do not use `--no-verify`.

If hooks seem skipped: from repo root run `pnpm prepare` (sets `core.hooksPath` to `.husky/_`).
