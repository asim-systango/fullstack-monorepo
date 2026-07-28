import { loadApiEnv, type ApiEnv } from '@shared/env';

/** Thin app config wrapper around `@shared/env`. */
export function appConfig(): Pick<ApiEnv, 'NODE_ENV' | 'PORT' | 'JWT_SECRET'> {
  const env = loadApiEnv();
  return {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    JWT_SECRET: env.JWT_SECRET,
  };
}
