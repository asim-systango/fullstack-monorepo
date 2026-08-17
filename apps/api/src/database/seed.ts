/**
 * Domain API seed script.
 *
 * The domain API (apps/api) does not own any user/auth seed data —
 * that responsibility belongs to the api-gateway (apps/api-gateway/src/database/seed.ts).
 *
 * Previously this script seeded hospital, hospital_branches, and user_roles tables.
 * Those tables have been removed (migration 1785932184730-DropUnusedTables) because
 * they had no frontend consumers and were part of an unimplemented enterprise schema.
 *
 * Run `pnpm seed:gateway` from the workspace root to seed the system.
 */

console.log(
  '✅ Domain API has no standalone seed data. Run `pnpm seed:gateway` to seed the system.',
);
