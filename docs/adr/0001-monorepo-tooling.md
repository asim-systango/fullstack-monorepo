# ADR 0001: Monorepo tooling (pnpm + Turborepo)

## Status

Accepted

## Context

The cohort needs one repository with Nest apps (API gateway BFF + domain API), a Next web app, and shared TypeScript packages.

## Decision

Use **pnpm workspaces** for package linking and **Turborepo** for task orchestration (`dev`, `build`, `lint`, `typecheck`). Shared code lives under `libs/` as **`@shared/*`**. Apps live under `apps/` as **`@app/*`** (`web`, `api-gateway`, `api`) — scopes stay project-agnostic so this starter can be reused without mass renames.

## Consequences

- Fast installs and clear `workspace:*` boundaries.
- Active shared packages: `@shared/env` (`constants` / `gateway` / `api`; `web` is optional), `@shared/http` (`filters` / `interceptors` / `auth` / `middleware` / `swagger`), `@shared/api-client`, `@shared/ui` (prefer `@shared/ui/components` + `theme.css` — [frontend.md](../frontend.md)), `@shared/types`, `@shared/config` (`eslint/base` only; apps extend repo-root `tsconfig.base.json`).
- Prefer **folder subpaths** when a lib has real folders (`index.ts` + `package.json` `exports["./folder"]`). Root entrypoints stay as thin re-exports.
- Unused stubs under `libs/` (`database`, `utils`) — leave alone until a real shared need appears.
- Stack smoke: `pnpm doctor` (`tools/scripts/doctor.sh`).
