import { loadApiEnv, type ApiEnv } from '@shared/env/api';

/** App config from `@shared/env/api`. */
export function appConfig(): Pick<
  ApiEnv,
  | 'NODE_ENV'
  | 'PORT'
  | 'JWT_SECRET'
  | 'JWT_EXPIRES_IN'
  | 'REFRESH_TOKEN_EXPIRES_IN'
  | 'COOKIE_SECURE'
  | 'CORS_ORIGIN'
> {
  const env = loadApiEnv();
  return {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    JWT_SECRET: env.JWT_SECRET,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN,
    COOKIE_SECURE: env.COOKIE_SECURE,
    CORS_ORIGIN: env.CORS_ORIGIN,
  };
}
