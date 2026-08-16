import { loadApiEnv, type ApiEnv } from '@shared/env/api';

/** App config from `@shared/env/api`. */
export function appConfig(): Pick<
  ApiEnv,
  'NODE_ENV' | 'PORT' | 'LISTEN_HOST' | 'JWT_SECRET'
> {
  const env = loadApiEnv();
  return {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    LISTEN_HOST: env.LISTEN_HOST,
    JWT_SECRET: env.JWT_SECRET,
  };
}
