# ADR 0001: Monorepo tooling (pnpm + Turborepo)

## Status

Accepted

## Context

The cohort needs one repository with Nest apps (API gateway BFF + domain API), a Next web app, and shared TypeScript packages. We considered Nx generators/workspace tooling versus a lighter pnpm workspaces + Turborepo setup.

## Decision

Use **pnpm workspaces** for package linking and **Turborepo** for task orchestration (`dev`, `build`, `lint`, `typecheck`). Shared code lives under `libs/` as **`@shared/*`**. Apps live under `apps/` as **`@app/*`** (`web`, `api-gateway`, `api`) — scopes stay project-agnostic so this starter can be reused without mass renames.

## Consequences

- Fast installs and clear `workspace:*` boundaries.
- No Nx dependency for learners. `tools/generators/` is an empty stub (not a generator plugin).
- Active shared packages apps import: `@shared/env` (folder: `constants` / `gateway` / `api` / `web`), `@shared/http` (folder: `filters` / `interceptors`), `@shared/api-client`, `@shared/ui` (prefer `@shared/ui/components` + `theme.css` — [frontend.md](../frontend.md)), `@shared/types`, `@shared/config` (`eslint/*`, `typescript/*`).
- Prefer **folder subpaths** when a lib has real folders (`index.ts` + `package.json` `exports["./folder"]`). Root entrypoints stay as thin re-exports.
- Unused stubs also exist under `libs/` (`database`, `utils`) — leave them alone until a real shared need appears.
