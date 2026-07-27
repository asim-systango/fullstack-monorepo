import { loadApiEnv } from '@repo/env';

/** Database connection settings for Nest TypeORM. */
export function databaseConfig() {
  const env = loadApiEnv();
  return {
    type: 'postgres' as const,
    url: env.DATABASE_URL,
    synchronize: false,
    migrationsRun: false,
  };
}
