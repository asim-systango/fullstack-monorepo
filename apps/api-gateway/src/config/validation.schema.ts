/**
 * Validation schema lives in `@shared/env` (`gatewayEnvSchema`).
 * Re-export here so Nest config lives under `src/config/`.
 */
export { gatewayEnvSchema, loadGatewayEnv, type GatewayEnv } from '@shared/env';
