import { loadGatewayEnv } from '@repo/env';

/** Database connection settings for Nest TypeORM. */
export function databaseConfig() {
  const env = loadGatewayEnv();
  return {
    type: 'postgres' as const,
    url: env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
  };
}
