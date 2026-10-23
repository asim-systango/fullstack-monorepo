import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'staff']),
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

export const onboardOrganizationSchema = z.object({
  name: z.string().min(2).max(150),
  primaryDomain: z.string().min(3).max(255),
  email: z.string().email(),
  phone: z.string().min(3),
  industry: z.string().min(2),
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPhone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional().default('Asia/Kolkata'),
  logoUrl: z.string().optional(),
});

export type OnboardOrganizationPayload = z.infer<typeof onboardOrganizationSchema>;
