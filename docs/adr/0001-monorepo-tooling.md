# ADR 0001: Monorepo tooling (pnpm + Turborepo)

## Status

Accepted

## Context

The cohort needs one repository with a Nest API, a Next web app, and shared TypeScript packages. We considered Nx generators/workspace tooling versus a lighter pnpm workspaces + Turborepo setup.

## Decision

Use **pnpm workspaces** for package linking and **Turborepo** for task orchestration (`dev`, `build`, `lint`, `typecheck`). Shared code lives under `libs/` (`@repo/*`). Apps live under `apps/`.

## Consequences

- Fast installs and clear `workspace:*` boundaries.
- No Nx dependency or generator plugin surface for learners.
- Keep the workspace lean: only packages that apps import (`env`, `api-client`, `ui`, `shared-types`, `config`).
