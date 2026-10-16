import { z } from 'zod';
import { nodeEnv } from '../node-env';

/**
 * Unified Nest API (`apps/api`) — auth + domain in one process.
 * Browser talks here directly (cookies + CORS); no api-gateway required.
 */
export const apiEnvSchema = z
  .object({
    NODE_ENV: nodeEnv,
    PORT: z.coerce.number().default(3002),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z
      .string()
      .regex(
        /^\d+[smhd]?$/,
        "must be digits with an optional s/m/h/d suffix (e.g. '900s', '15m', '7d')",
      )
      .default('7d'),
    REFRESH_TOKEN_EXPIRES_IN: z
      .string()
      .regex(
        /^\d+[smhd]?$/,
        "must be digits with an optional s/m/h/d suffix (e.g. '30d')",
      )
      .default('30d'),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
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
