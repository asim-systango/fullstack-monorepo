import { z } from 'zod';

export const AUTH_COOKIE_NAME = 'access_token';

const nodeEnv = z.enum(['development', 'test', 'production']).default('development');

/** Browser-facing BFF (`apps/api-gateway`). */
export const gatewayEnvSchema = z
  .object({
    NODE_ENV: nodeEnv,
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().default('7d'),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    API_UPSTREAM_URL: z.string().url().default('http://localhost:3002'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true in production',
      });
    }
  });

export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;

export function loadGatewayEnv(
  env: Record<string, string | undefined> = process.env,
): GatewayEnv {
  const parsed = gatewayEnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid gateway environment:\n${details}`);
  }
  return parsed.data;
}

/** Internal domain API (`apps/api`) — Bearer JWT only, no browser cookies. */
export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnv,
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(
  env: Record<string, string | undefined> = process.env,
): ApiEnv {
  const parsed = apiEnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid API environment:\n${details}`);
  }
  return parsed.data;
}

export const webEnvSchema = z.object({
  /** Browser axios base — default `/api` (Next rewrite → gateway). */
  NEXT_PUBLIC_API_URL: z.string().min(1).default('/api'),
  /** Server-only rewrite target for next.config.ts. */
  API_GATEWAY_URL: z.string().url().default('http://localhost:3001'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function loadWebEnv(
  env: Record<string, string | undefined> = process.env,
): WebEnv {
  const parsed = webEnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid web environment:\n${details}`);
  }
  return parsed.data;
}
