import { loadGatewayEnv } from '@shared/env/gateway';

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
