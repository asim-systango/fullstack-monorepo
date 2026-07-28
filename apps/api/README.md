# Domain API (`apps/api`)

Internal Nest API on **:3002**. Browser never talks here directly — traffic comes from the gateway with Bearer JWT.

```bash
cp .env.example .env
pnpm dev:api    # from repo root
```

**Your work:** modules under `src/modules/` (`*.entity.ts` + `TypeOrmModule.forFeature`).

- Domain migrations: `pnpm migration:run:api` / `pnpm migration:generate`
- Users/auth stay on `apps/api-gateway`
- Smoke via UI path: `http://localhost:3000/api/ready`
- Swagger: `http://localhost:3002/docs`
