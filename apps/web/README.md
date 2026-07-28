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

## Styling & UI kit

| Piece                          | Location                                                              |
| ------------------------------ | --------------------------------------------------------------------- |
| CSS entry                      | `styles/globals.css` → Tailwind + `@shared/ui/theme.css` + `base.css` |
| Theme tokens / `.ui-*` recipes | `libs/ui/src/theme/` (via `@shared/ui/theme.css`)                     |
| Shared components              | `@shared/ui/components`                                               |
| Gallery                        | [/ui](http://localhost:3000/ui)                                       |

Full guide: [docs/frontend.md](../../docs/frontend.md). Prefer theme-backed components over one-off colors.

Add pages under `app/`. Do not put product CRUD in Next Route Handlers.
