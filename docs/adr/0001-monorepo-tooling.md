# ADR 0001: Monorepo tooling (pnpm + Turborepo)

## Status

Accepted

## Context

The cohort needs one repository with Nest apps (API gateway BFF + domain API), a Next web app, and shared TypeScript packages. We considered Nx generators/workspace tooling versus a lighter pnpm workspaces + Turborepo setup.

## Decision

Use **pnpm workspaces** for package linking and **Turborepo** for task orchestration (`dev`, `build`, `lint`, `typecheck`). Shared code lives under `libs/` (`@repo/*`). Apps live under `apps/` — currently `web`, `api-gateway` (BFF), and `api` (domain).

## Consequences

- Fast installs and clear `workspace:*` boundaries.
- No Nx dependency for learners. `tools/generators/` is an empty stub (not a generator plugin).
- Active shared packages apps import: `env`, `api-client`, `ui`, `shared-types`, `config`.
- Unused stubs also exist under `libs/` (`database`, `utils`) — leave them alone unless the instructor asks.
