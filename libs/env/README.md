# @shared/env

Zod-validated environment loaders. Prefer **folder subpaths**.

| Import                  | Required?              | Used by                                                                                                                                                                           |
| ----------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@shared/env/constants` | Yes (shared constants) | Gateway + proxy hop (`AUTH_COOKIE_NAME`, etc.)                                                                                                                                    |
| `@shared/env/gateway`   | Yes for gateway        | `apps/api-gateway` (`loadGatewayEnv`)                                                                                                                                             |
| `@shared/env/api`       | Yes for domain API     | `apps/api` (`loadApiEnv`)                                                                                                                                                         |
| `@shared/env/web`       | **Optional**           | Not wired in the starter — call `loadWebEnv` only if you want Zod checks for `NEXT_PUBLIC_API_URL` / `API_GATEWAY_URL`. Web runs from `.env.local` + `next.config.ts` without it. |
| `@shared/env`           | —                      | Thin re-export of all folders (prefer folder paths)                                                                                                                               |
