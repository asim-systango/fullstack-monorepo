import { loadApiEnv, type ApiEnv } from '@repo/env';

/** Thin app config wrapper around `@repo/env`. */
export function appConfig(): Pick<
  ApiEnv,
  'NODE_ENV' | 'PORT' | 'CORS_ORIGIN' | 'COOKIE_SECURE' | 'JWT_SECRET' | 'JWT_EXPIRES_IN'
> {
  const env = loadApiEnv();
  return {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    CORS_ORIGIN: env.CORS_ORIGIN,
    COOKIE_SECURE: env.COOKIE_SECURE,
    JWT_SECRET: env.JWT_SECRET,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
  };
}
