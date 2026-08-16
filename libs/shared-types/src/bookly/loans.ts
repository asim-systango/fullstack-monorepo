import { z } from 'zod';
import { bookCopySchema, bookSchema } from './books';
import { fineStatusSchema, loanFilterStatusSchema } from './enums';
import { paginatedSchema, paginationParamsSchema } from './pagination';

export const MEMBER_BORROW_LIMIT_MESSAGE =
  'Borrowing limit reached. A member can have a maximum of 2 books at a time.';

export const OVERDUE_NOTICE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const fineBaseSchema = z.object({
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
});
export type FineBase = z.infer<typeof fineBaseSchema>;

export const loanBaseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bookCopyId: z.string().uuid(),
  bookId: z.string().uuid(),
  borrowedAt: z.string(),
  dueDate: z.string(),
  returnedAt: z.string().nullable(),
  checkedOutBy: z.string().uuid(),
  returnedTo: z.string().uuid().nullable(),
  overdueNotifiedAt: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LoanBase = z.infer<typeof loanBaseSchema>;

export const loanSchema = loanBaseSchema.extend({
  book: bookSchema.optional(),
  bookCopy: bookCopySchema.optional(),
  fine: fineBaseSchema.nullable().optional(),
});
export type Loan = z.infer<typeof loanSchema>;

export const loanMemberSchema = z.object({
  fullName: z.string(),
  email: z.string(),
});
export type LoanMember = z.infer<typeof loanMemberSchema>;

export const loanWithRelationsSchema = loanBaseSchema.extend({
  book: bookSchema,
  bookCopy: bookCopySchema,
  fine: fineBaseSchema.nullable(),
  member: loanMemberSchema.optional(),
});
export type LoanWithRelations = z.infer<typeof loanWithRelationsSchema>;

export const overdueLoanSchema = loanWithRelationsSchema.extend({
  daysLate: z.number().int(),
  fineAmountCents: z.number().int().nullable(),
  fineStatus: fineStatusSchema.nullable(),
});
export type OverdueLoan = z.infer<typeof overdueLoanSchema>;

export const memberDashboardLoanSchema = loanBaseSchema.extend({
  book: bookSchema,
  bookCopy: bookCopySchema,
  overdue: z.boolean(),
});
export type MemberDashboardLoan = z.infer<typeof memberDashboardLoanSchema>;

export const paginatedLoansSchema = paginatedSchema(loanWithRelationsSchema);
export type PaginatedLoans = z.infer<typeof paginatedLoansSchema>;

export const paginatedOverdueLoansSchema = paginatedSchema(overdueLoanSchema);
export type PaginatedOverdueLoans = z.infer<typeof paginatedOverdueLoansSchema>;

export const listLoansParamsSchema = paginationParamsSchema.extend({
  userId: z.string().uuid().optional(),
  bookId: z.string().uuid().optional(),
  status: loanFilterStatusSchema.optional(),
  q: z.string().max(200).optional(),
});
export type ListLoansParams = z.infer<typeof listLoansParamsSchema>;

export const lookupLoanParamsSchema = z
  .object({
    barcode: z.string().max(50).optional(),
    userId: z.string().uuid().optional(),
    loanId: z.string().uuid().optional(),
  })
  .refine(
    (v) =>
      [v.barcode, v.userId, v.loanId].filter((x) => x != null && x !== '').length === 1,
    { message: 'Provide exactly one of barcode, userId, or loanId' },
  );
export type LookupLoanParams = z.infer<typeof lookupLoanParamsSchema>;

export const overdueNoticeBulkResultSchema = z.object({
  sent: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type OverdueNoticeBulkResult = z.infer<typeof overdueNoticeBulkResultSchema>;

export const checkoutLoanInputSchema = z.object({
  userId: z.string().uuid(),
  bookCopyId: z.string().uuid(),
  dueDate: z.string().optional(),
});
export type CheckoutLoanInput = z.infer<typeof checkoutLoanInputSchema>;

export const OVERDUE_RETURN_SETTLEMENT_MESSAGE =
  'This book is overdue. Select Paid or Unpaid for the fine before confirming return.';

export const returnLoanInputSchema = z.object({
  fineSettlement: z.enum(['paid', 'unpaid']).optional(),
});
export type ReturnLoanInput = z.infer<typeof returnLoanInputSchema>;
