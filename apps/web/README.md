# Web (`apps/web` → `@app/web`)

Next UI on **:3000**. Browser calls **`/api/*`** only; Next rewrites that to the gateway.

```bash
cp .env.local.example .env.local
pnpm dev:web    # from repo root
```

**Scripts (via root):** `pnpm dev:web` · `build:web` · `start:web` · `typecheck:web`

| Env                                     | Meaning          |
| --------------------------------------- | ---------------- |
| `NEXT_PUBLIC_API_URL=/api`              | Browser API base |
| `API_GATEWAY_URL=http://localhost:3001` | Rewrite target   |

Shared UI/client: `@shared/ui`, `@shared/api-client`.

Add pages under `app/`. Do not put product CRUD in Next Route Handlers.
