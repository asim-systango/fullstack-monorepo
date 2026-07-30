import { z } from 'zod';
import { nodeEnv } from '../node-env';

/** Browser-facing BFF (`apps/api-gateway`). */
export const gatewayEnvSchema = z
  .object({
    NODE_ENV: nodeEnv,
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    // Constrained to what `jwtExpiryToMs` (auth.service.ts) can parse, so the cookie
    // maxAge always matches the token TTL. `@nestjs/jwt` accepts looser ms-style
    // values (e.g. '1.5h'), which would silently yield a 7-day cookie around a
    // 90-minute token — fail at boot instead.
    JWT_EXPIRES_IN: z
      .string()
      .regex(
        /^\d+[smhd]?$/,
        "must be digits with an optional s/m/h/d suffix (e.g. '900s', '15m', '7d')",
      )
      .default('7d'),
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
