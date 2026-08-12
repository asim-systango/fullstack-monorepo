import { z } from 'zod';
import { nodeEnv } from '../node-env';

/** Internal domain API (`apps/api`) — Bearer JWT only, no browser cookies. */
export const apiEnvSchema = z
  .object({
    NODE_ENV: nodeEnv,
    PORT: z.coerce.number().default(3002),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    /** Razorpay test/live keys — both required to enable real checkout. */
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    /** Dev-only: skip TLS verification when a corporate proxy breaks Razorpay HTTPS. */
    RAZORPAY_TLS_INSECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  })
  .superRefine((env, ctx) => {
    const hasId = Boolean(env.RAZORPAY_KEY_ID?.trim());
    const hasSecret = Boolean(env.RAZORPAY_KEY_SECRET?.trim());
    if (hasId !== hasSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RAZORPAY_KEY_ID'],
        message: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must both be set or both omitted',
      });
    }
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.RAZORPAY_TLS_INSECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RAZORPAY_TLS_INSECURE'],
        message: 'RAZORPAY_TLS_INSECURE must be false in production',
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
