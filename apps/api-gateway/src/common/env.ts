/** Re-export shared env — single source of truth lives in `@shared/env`. */
export { AUTH_COOKIE_NAME } from '@shared/env/constants';
export { gatewayEnvSchema, loadGatewayEnv, type GatewayEnv } from '@shared/env/gateway';
