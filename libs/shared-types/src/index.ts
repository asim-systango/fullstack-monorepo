import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'staff']),
  emailVerified: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

export const verifyEmailInputSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationInputSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationInputSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;

export const groupSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  currency: z.string(),
  blocked: z.boolean(),
  myRole: z.enum(['admin', 'member']).nullable(),
  createdAt: z.string(),
});

export const groupMemberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
  joinedAt: z.string(),
});

export const groupDetailSchema = groupSummarySchema.extend({
  members: z.array(groupMemberSchema),
});

export const expenseSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  amountCents: z.number().int(),
  category: z.string().nullable(),
  expenseDate: z.string(),
  payer: z.object({ id: z.string().uuid(), name: z.string() }),
  shares: z.array(z.object({ userId: z.string().uuid(), amountCents: z.number().int() })),
});

export const balanceMemberSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  netCents: z.number().int(),
});

export const balanceDebtSchema = z.object({
  fromUserId: z.string().uuid(),
  fromName: z.string(),
  toUserId: z.string().uuid(),
  toName: z.string(),
  amountCents: z.number().int(),
});

export const balancesSchema = z.object({
  groupId: z.string().uuid(),
  currency: z.string(),
  members: z.array(balanceMemberSchema),
  debts: z.array(balanceDebtSchema),
  allClear: z.boolean(),
});

export type GroupSummary = z.infer<typeof groupSummarySchema>;
export type GroupDetail = z.infer<typeof groupDetailSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Balances = z.infer<typeof balancesSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
