import { loadGatewayEnv } from '@shared/env/gateway';

/** Database connection settings for Nest TypeORM. */
export function databaseConfig() {
  const env = loadGatewayEnv();
  return {
    type: 'postgres' as const,
    url: env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
    ssl: env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  };
}
