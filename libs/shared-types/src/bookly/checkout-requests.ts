import { z } from 'zod';
import { bookSchema } from './books';
import { checkoutRequestStatusSchema, memberStatusSchema } from './enums';
import { paginatedSchema, paginationParamsSchema } from './pagination';

export const checkoutRequestLoanSummarySchema = z.object({
  id: z.string().uuid(),
  borrowedAt: z.string(),
  dueDate: z.string(),
});
export type CheckoutRequestLoanSummary = z.infer<typeof checkoutRequestLoanSummarySchema>;

export const checkoutRequestMemberSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string(),
  email: z.string(),
  status: memberStatusSchema,
});
export type CheckoutRequestMember = z.infer<typeof checkoutRequestMemberSchema>;

export const checkoutRequestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bookId: z.string().uuid(),
  status: checkoutRequestStatusSchema,
  loanId: z.string().uuid().nullable(),
  bookCopyId: z.string().uuid().nullable(),
  issuedBy: z.string().uuid().nullable(),
  rejectedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  fulfilledAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  book: bookSchema,
  loan: checkoutRequestLoanSummarySchema.nullable().optional(),
  member: checkoutRequestMemberSchema.optional(),
  suggestedDueDate: z.string().optional(),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const paginatedCheckoutRequestsSchema = paginatedSchema(checkoutRequestSchema);
export type PaginatedCheckoutRequests = z.infer<typeof paginatedCheckoutRequestsSchema>;

export const listCheckoutRequestsParamsSchema = paginationParamsSchema.extend({
  userId: z.string().uuid().optional(),
  bookId: z.string().uuid().optional(),
  status: checkoutRequestStatusSchema.optional(),
  q: z.string().max(200).optional(),
});
export type ListCheckoutRequestsParams = z.infer<typeof listCheckoutRequestsParamsSchema>;

export const createCheckoutRequestInputSchema = z.object({
  bookId: z.string().uuid(),
});
export type CreateCheckoutRequestInput = z.infer<typeof createCheckoutRequestInputSchema>;

export const issueCheckoutRequestInputSchema = z.object({
  bookCopyId: z.string().uuid(),
  dueDate: z.string().optional(),
});
export type IssueCheckoutRequestInput = z.infer<typeof issueCheckoutRequestInputSchema>;

export const rejectCheckoutRequestInputSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type RejectCheckoutRequestInput = z.infer<typeof rejectCheckoutRequestInputSchema>;
