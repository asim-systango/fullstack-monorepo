import { loadApiEnv } from '@shared/env/api';

export function databaseConfig() {
  const env = loadApiEnv();
  return {
    type: 'postgres' as const,
    url: env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
    migrationsTableName: 'migrations_api',
  };
}
