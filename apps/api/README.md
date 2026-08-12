# Domain API (`apps/api` → `@app/api`)

Internal Nest API on **:3002**. Browser never talks here directly — traffic comes from the gateway with Bearer JWT.

```bash
cp .env.example .env
pnpm dev:api    # from repo root
```

**Scripts (via root):** `pnpm dev:api` · `build:api` · `start:api` · `typecheck:api` · `test:api` · `migration:run:api` · `migration:generate` · `migration:revert:api` · `seed:api`

**Your work:** modules under `src/modules/` (`*.entity.ts` + `TypeOrmModule.forFeature`).

- Domain migrations: `pnpm migration:run:api` / `pnpm migration:generate`
- Users/auth stay on `apps/api-gateway` (`@app/api-gateway`)
- Shared HTTP helpers: `@shared/http/filters`, `@shared/http/interceptors`, `@shared/http/auth` · env: `@shared/env/api`
- Prefer folder barrels for app code: `./config`, `./common/auth`, `./modules/health`
- Smoke: hop 1 `http://localhost:3002/ready` or full path `http://localhost:3000/api/ready` (`pnpm doctor`)
- Swagger: `http://localhost:3002/docs`
- Note: browser `/api/health` is the **gateway** health check; domain liveness for proxies is `/ready`

## Razorpay sandbox

1. Create test keys at [Razorpay Dashboard → API Keys](https://dashboard.razorpay.com/app/keys).
2. Add to `apps/api/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
3. Restart `pnpm dev:api`. Checkout opens the Razorpay modal; verify uses HMAC signature check.

Without both keys, payments stay in **mock mode** (demo dialog, no real charge).
Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

**TLS / corporate proxy:** if checkout returns 500 with certificate errors, add
`RAZORPAY_TLS_INSECURE=true` to `.env` for local dev only.
