import { z } from 'zod';
import { bookCopySchema, bookSchema } from './books';
import { memberStatusSchema } from './enums';
import { loanBaseSchema } from './loans';
import { paginatedSchema, paginationParamsSchema } from './pagination';

export const memberProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  status: memberStatusSchema,
  suspendedReason: z.string().nullable(),
  suspendedAt: z.string().nullable(),
  suspendedBy: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MemberProfile = z.infer<typeof memberProfileSchema>;

export const memberListSortSchema = z.enum([
  'fullName',
  '-fullName',
  'createdAt',
  '-createdAt',
]);
export type MemberListSort = z.infer<typeof memberListSortSchema>;

export const memberListItemSchema = memberProfileSchema.extend({
  activeLoanCount: z.number().int().nonnegative(),
  outstandingBalanceCents: z.number().int(),
  maxActiveLoans: z.number().int().positive(),
  role: z.enum(['admin', 'user', 'staff']),
});
export type MemberListItem = z.infer<typeof memberListItemSchema>;

export const memberSearchHitSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  activeLoanCount: z.number().int().nonnegative(),
});
export type MemberSearchHit = z.infer<typeof memberSearchHitSchema>;

export const memberLoanSummarySchema = z.object({
  userId: z.string().uuid(),
  activeLoanCount: z.number().int().nonnegative(),
  maxActiveLoans: z.number().int().positive(),
  remaining: z.number().int(),
  status: memberStatusSchema,
});
export type MemberLoanSummary = z.infer<typeof memberLoanSummarySchema>;

export const memberDetailLoanSchema = loanBaseSchema.extend({
  book: bookSchema.nullish(),
  bookCopy: bookCopySchema.nullish(),
});

export const memberDetailSchema = memberProfileSchema.extend({
  activeLoanCount: z.number().int().nonnegative(),
  outstandingBalanceCents: z.number().int(),
  loans: z.array(memberDetailLoanSchema),
});
export type MemberDetail = z.infer<typeof memberDetailSchema>;

export const paginatedMembersSchema = paginatedSchema(memberListItemSchema);
export type PaginatedMembers = z.infer<typeof paginatedMembersSchema>;

export const listMembersParamsSchema = paginationParamsSchema.extend({
  q: z.string().max(200).optional(),
  status: memberStatusSchema.optional(),
  role: z.enum(['admin', 'user', 'staff']).optional(),
  sort: memberListSortSchema.optional(),
});
export type ListMembersParams = z.infer<typeof listMembersParamsSchema>;

export const searchMembersParamsSchema = z.object({
  q: z.string().min(1).max(200),
});
export type SearchMembersParams = z.infer<typeof searchMembersParamsSchema>;

export const suspendMemberInputSchema = z.object({
  reason: z.string().min(1).max(500),
});
export type SuspendMemberInput = z.infer<typeof suspendMemberInputSchema>;
