/**
 * Validation schema lives in `@repo/env` (`apiEnvSchema`).
 * Re-export here so Nest config lives under `src/config/`.
 */
export { apiEnvSchema, loadApiEnv, type ApiEnv } from '@repo/env';
