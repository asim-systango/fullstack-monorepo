import { z } from 'zod';
import { nodeEnv } from '../node-env';

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
