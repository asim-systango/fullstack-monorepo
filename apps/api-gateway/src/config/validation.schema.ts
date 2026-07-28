/**
 * Validation schema lives in `@repo/env` (`gatewayEnvSchema`).
 * Re-export here so Nest config lives under `src/config/`.
 */
export { gatewayEnvSchema, loadGatewayEnv, type GatewayEnv } from '@repo/env';
