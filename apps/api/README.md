# Domain API (`apps/api` → `@app/api`)

Internal Nest API on **:3002**. Browser never talks here directly — traffic comes from the gateway with Bearer JWT.

```bash
cp .env.example .env
pnpm dev:api    # from repo root
```

**Scripts (via root):** `pnpm dev:api` · `build:api` · `start:api` · `typecheck:api` · `test:api` · `migration:run:api` · `migration:generate` · `migration:revert:api`

**Your work:** modules under `src/modules/` (`*.entity.ts` + `TypeOrmModule.forFeature`).

- Domain migrations: `pnpm migration:run:api` / `pnpm migration:generate`
- Users/auth stay on `apps/api-gateway` (`@app/api-gateway`)
- Shared HTTP helpers: `@shared/http` · env: `@shared/env`
- Smoke: hop 1 `http://localhost:3002/ready` or full path `http://localhost:3000/api/ready` (`pnpm doctor`)
- Swagger: `http://localhost:3002/docs`
- Note: browser `/api/health` is the **gateway** health check; domain liveness for proxies is `/ready`
