/**
 * Optional web env helper — not wired into `apps/web`.
 * Nest uses `@shared/env/gateway` / `@shared/env/api`. Next reads `.env.local` directly.
 * Call `loadWebEnv` only if you want Zod validation for these keys.
 */
import { z } from 'zod';

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
