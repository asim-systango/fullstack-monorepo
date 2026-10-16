import { z } from 'zod';
import { bookSchema } from './books';
import { fineStatusSchema } from './enums';
import { loanBaseSchema } from './loans';
import { paginatedSchema, paginationParamsSchema } from './pagination';

export { fineBaseSchema } from './loans';
export type { FineBase } from './loans';

export const fineLoanSchema = loanBaseSchema.extend({
  book: bookSchema,
});

export const fineSchema = z.object({
  id: z.string().uuid(),
  loanId: z.string().uuid(),
  userId: z.string().uuid(),
  daysOverdue: z.number().int(),
  amountCents: z.number().int(),
  status: fineStatusSchema,
  paidAt: z.string().nullable(),
  markedPaidBy: z.string().uuid().nullable(),
  waivedReason: z.string().nullable(),
  waivedAt: z.string().nullable(),
  waivedBy: z.string().uuid().nullable(),
  createdAt: z.string(),
  loan: fineLoanSchema.optional(),
});
export type Fine = z.infer<typeof fineSchema>;

export const fineWithLoanSchema = fineSchema.extend({
  loan: fineLoanSchema,
});
export type FineWithLoan = z.infer<typeof fineWithLoanSchema>;

export const paginatedFinesSchema = paginatedSchema(fineWithLoanSchema);
export type PaginatedFines = z.infer<typeof paginatedFinesSchema>;

export const listFinesParamsSchema = paginationParamsSchema.extend({
  userId: z.string().uuid().optional(),
  status: fineStatusSchema.optional(),
});
export type ListFinesParams = z.infer<typeof listFinesParamsSchema>;

export const waiveFineInputSchema = z.object({
  reason: z.string().min(1).max(500),
});
export type WaiveFineInput = z.infer<typeof waiveFineInputSchema>;
