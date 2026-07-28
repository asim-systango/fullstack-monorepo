import { loadGatewayEnv, type GatewayEnv } from '@shared/env/gateway';

/** App config from `@shared/env/gateway`. */
export function appConfig(): Pick<
  GatewayEnv,
  | 'NODE_ENV'
  | 'PORT'
  | 'CORS_ORIGIN'
  | 'COOKIE_SECURE'
  | 'JWT_SECRET'
  | 'JWT_EXPIRES_IN'
  | 'API_UPSTREAM_URL'
> {
  const env = loadGatewayEnv();
  return {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    CORS_ORIGIN: env.CORS_ORIGIN,
    COOKIE_SECURE: env.COOKIE_SECURE,
    JWT_SECRET: env.JWT_SECRET,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
    API_UPSTREAM_URL: env.API_UPSTREAM_URL,
  };
}
