# @shared/config

Shared tooling configs for this monorepo.

| Import                       | Used by                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `@shared/config/eslint/base` | Root `eslint.config.mjs`, Nest apps, and as the base for `apps/web/eslint.config.mjs` |

TypeScript apps extend the repo-root `tsconfig.base.json` (and per-app `tsconfig.json`), not package exports under `@shared/config`. Web Next lint rules come from `eslint-config-next` via FlatCompat in `apps/web/eslint.config.mjs`, layered on top of `eslint/base`.
