import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'staff']),
  emailVerified: z.boolean().optional(),
});

export type User = z.infer<typeof userSchema>;

export const authTokensSchema = z.object({
  user: userSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export * from './bookly';
