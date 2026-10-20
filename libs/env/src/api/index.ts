import { z } from 'zod';
import { nodeEnv } from '../node-env';

export const apiEnvSchema = z
  .object({
    NODE_ENV: nodeEnv,
    PORT: z.coerce.number().default(3002),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_TLS_INSECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    CLOUDINARY_CLOUD_NAME: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        'Use the exact Cloud name from the Cloudinary dashboard (lowercase letters, numbers, hyphens only — not your product title)',
      )
      .optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
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
    const cloudName = Boolean(env.CLOUDINARY_CLOUD_NAME?.trim());
    const apiKey = Boolean(env.CLOUDINARY_API_KEY?.trim());
    const apiSecret = Boolean(env.CLOUDINARY_API_SECRET?.trim());
    const count = [cloudName, apiKey, apiSecret].filter(Boolean).length;
    if (count !== 0 && count !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CLOUDINARY_CLOUD_NAME'],
        message:
          'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must all be set or all omitted',
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
