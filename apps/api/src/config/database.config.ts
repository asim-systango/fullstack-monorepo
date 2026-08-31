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
    // Must match apps/api/src/database/data-source.ts — this app and the gateway
    // share one DATABASE_URL and must not share a migration ledger.
    migrationsTableName: 'migrations_api',
  };
}
