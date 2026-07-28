# Adding an optional service (Stretch)

**Default:** put domain work in `apps/api/src/modules/` (same process, port `:3002`).

**Stretch only:** add another Nest app under `apps/` on its own port, then route it through the gateway.

```text
Browser → web :3000 /api/* → gateway :3001 → api :3002
                                         → your-service :3003
```

## Module vs service

| This                                   | Means                                                  |
| -------------------------------------- | ------------------------------------------------------ |
| `apps/api/src/modules/catalog/`        | Folder inside the domain API — **not** a separate port |
| `apps/catalog/` with its own `main.ts` | Real microservice — own port                           |

## How to add one

Example: `apps/notifications` on `:3003`.

1. Copy the shape of `apps/api` (Nest app, Bearer JWT, `.env` with `PORT=3003` and the **same** `JWT_SECRET`).
2. Package name like `@fullstack/notifications`.
3. Run it: `pnpm --filter @fullstack/notifications dev` (optional: add `dev:notifications` in root `package.json`).
4. On the gateway, proxy a path (e.g. `/notifications`) to `http://localhost:3003`.
5. Keep the browser on `/api` → gateway. Do not point Next at the new service.
6. Note ports and paths in your PR / `docs/architecture.md`.

Must still passes on **web + gateway + api** alone. Extra services are bonus.
