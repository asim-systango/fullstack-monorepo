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

**Styling:** Tailwind CSS v4 (CSS-first). Theme tokens live in `styles/globals.css` (`@theme` + light/dark CSS variables). Shared primitives: `@shared/ui` (uses the same tokens; scanned via `@source`).

Add pages under `app/`. Do not put product CRUD in Next Route Handlers.
