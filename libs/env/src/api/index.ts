import { z } from 'zod';
import { nodeEnv } from '../node-env';
import { durationStringSchema } from './duration';
import { normalizeApiEnv } from './normalize-env';

export { parseDurationToMs, durationStringSchema } from './duration';
export { normalizeApiEnv } from './normalize-env';

/** Internal domain API (`apps/api`) — auth, Splitter domain, SMTP mail. */
export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnv,
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: durationStringSchema('7d'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  APP_PUBLIC_URL: z.string().url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_REQUIRE_TLS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_FROM: z.string().min(1),
  EMAIL_VERIFICATION_EXPIRES_IN: durationStringSchema('1d'),
  PASSWORD_RESET_EXPIRES_IN: durationStringSchema('30m'),
  GROUP_INVITE_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(
  env: Record<string, string | undefined> = process.env,
): ApiEnv {
  const normalized = normalizeApiEnv(env);
  const parsed = apiEnvSchema.safeParse(normalized);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid API environment:\n${details}`);
  }
  return parsed.data;
}
