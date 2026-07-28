/** Re-export shared env — single source of truth lives in `@repo/env`. */
export {
  AUTH_COOKIE_NAME,
  gatewayEnvSchema,
  loadGatewayEnv,
  type GatewayEnv,
} from '@repo/env';
