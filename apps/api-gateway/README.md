# API gateway (`apps/api-gateway` → `@app/api-gateway`)

BFF on **:3001**: cookie JWT (`/auth/*`), CORS, and proxy to the domain API.

```bash
cp .env.example .env
pnpm dev:gateway    # from repo root
```

**Scripts (via root):** `pnpm dev:gateway` · `build:gateway` · `start:gateway` · `typecheck:gateway` · `test:gateway` · `migration:run` · `migration:revert` · `seed`

- Users migration + seed: `pnpm migration:run` / `pnpm seed` (from repo root)
- `API_UPSTREAM_URL` → domain API (default `http://localhost:3002`)
- Same `JWT_SECRET` as `apps/api` (`@app/api`)
- Shared HTTP helpers: `@shared/http` · env: `@shared/env`
- Swagger: `http://localhost:3001/docs`

Domain modules go in `apps/api`, not here.
