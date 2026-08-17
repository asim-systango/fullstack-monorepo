import { z } from 'zod';

export const roleEnum = z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'admin', 'user', 'staff']);
export type Role = z.infer<typeof roleEnum>;

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: roleEnum,
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type User = z.infer<typeof userSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
