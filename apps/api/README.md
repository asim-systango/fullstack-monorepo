# Fullstack Nest API — shared boilerplate only.

Included: cookie JWT auth, users, health, ValidationPipe (field-level `details`),
exception filter, `{ data }` response envelope, TypeORM migrations (users).

Your work: add domain modules under `src/modules/` (`*.entity.ts` +
`TypeOrmModule.forFeature`). Do not put product CRUD in Next Route Handlers.

Env: copy `.env.example` → `.env`. Migrations/seed use the same load-env rules
(first existing of `apps/api/.env` then repo-root `.env`).

Swagger (dev): `http://localhost:3001/docs`
