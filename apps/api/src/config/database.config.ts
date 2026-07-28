import { loadApiEnv } from '@shared/env/api';

/** Database connection settings for Nest TypeORM. */
export function databaseConfig() {
  const env = loadApiEnv();
  return {
    type: 'postgres' as const,
    url: env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
  };
}
