/**
 * Shared database helpers stub.
 * Entities and migrations live in the apps (`apps/api`, gateway users).
 * Promote shared pieces here only if multiple services need them.
 */
export const DATABASE_PROVIDER = 'typeorm' as const;

export type DatabaseProvider = typeof DATABASE_PROVIDER;
