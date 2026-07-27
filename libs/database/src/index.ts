/**
 * Shared database helpers.
 * Entities and migrations are owned by `apps/api` (TypeORM) for this course.
 * Promote shared entities here when multiple services need them.
 */
export const DATABASE_PROVIDER = 'typeorm' as const;

export type DatabaseProvider = typeof DATABASE_PROVIDER;
