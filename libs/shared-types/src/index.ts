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
  updatedAt: z.string(),
  memberCount: z.number().int().nonnegative(),
  myNetCents: z.number().int(),
  memberPreviews: z.array(z.object({ name: z.string() })).optional(),
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

export const groupPageSchema = z.object({
  items: z.array(groupSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  stats: z.object({
    totalGroups: z.number().int().nonnegative(),
    activeGroups: z.number().int().nonnegative(),
    youAreOwedCents: z.number().int().nonnegative(),
    youOweCents: z.number().int().nonnegative(),
  }),
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
export type GroupPage = z.infer<typeof groupPageSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Balances = z.infer<typeof balancesSchema>;

export const expensePageSchema = z.object({
  items: z.array(expenseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().positive(),
});

export type ExpensePage = z.infer<typeof expensePageSchema>;

export const friendGroupRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.enum(['admin', 'member']),
});

export const friendPersonSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  groups: z.array(friendGroupRefSchema),
});

export const friendGroupMemberSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
  joinedAt: z.string(),
});

export const friendGroupSectionSchema = z.object({
  group: z.object({
    id: z.string().uuid(),
    name: z.string(),
    currency: z.string(),
  }),
  members: z.array(friendGroupMemberSchema),
  memberCount: z.number().int().nonnegative(),
});

export type FriendPerson = z.infer<typeof friendPersonSchema>;
export type FriendGroupSection = z.infer<typeof friendGroupSectionSchema>;

export const friendsPageBaseSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  stats: z.object({
    uniqueFriends: z.number().int().nonnegative(),
    sharedGroups: z.number().int().nonnegative(),
  }),
  groupOptions: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
});

export const friendsGroupsPageSchema = friendsPageBaseSchema.extend({
  view: z.literal('groups'),
  items: z.array(friendGroupSectionSchema),
});

export const friendsPeoplePageSchema = friendsPageBaseSchema.extend({
  view: z.literal('people'),
  items: z.array(friendPersonSchema),
});

export const friendsPageSchema = z.discriminatedUnion('view', [
  friendsGroupsPageSchema,
  friendsPeoplePageSchema,
]);

export type FriendsGroupsPage = z.infer<typeof friendsGroupsPageSchema>;
export type FriendsPeoplePage = z.infer<typeof friendsPeoplePageSchema>;
export type FriendsPage = z.infer<typeof friendsPageSchema>;

export const invitationSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  groupName: z.string(),
  inviteeEmail: z.string().email(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired']),
  expiresAt: z.string(),
  createdAt: z.string(),
});

export const invitePreviewSchema = z.object({
  groupId: z.string().uuid(),
  groupName: z.string(),
  inviteeEmail: z.string().email(),
  hasAccount: z.boolean(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired']),
});

export type Invitation = z.infer<typeof invitationSchema>;
export type InvitePreview = z.infer<typeof invitePreviewSchema>;

export const lookupUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

export const expenseShareInputSchema = z.object({
  userId: z.string().uuid(),
  amountCents: z.number().int().min(0),
});

export const createExpenseInputSchema = z.object({
  description: z.string().min(1).max(500),
  amountCents: z.number().int().min(1),
  payerUserId: z.string().uuid(),
  category: z.string().max(100).optional(),
  expenseDate: z.string().min(1),
  shares: z.array(expenseShareInputSchema).min(1),
});

export const expenseDetailSchema = expenseSchema.extend({
  createdBy: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
});

export const deletedExpenseSchema = expenseSchema.extend({
  deletedAt: z.string().nullable(),
  deletedBy: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
});

export const settlementSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  payer: z.object({ id: z.string().uuid(), name: z.string() }),
  payee: z.object({ id: z.string().uuid(), name: z.string() }),
  amountCents: z.number().int(),
  note: z.string().nullable(),
  settledAt: z.string(),
  createdAt: z.string(),
});

export const createSettlementInputSchema = z.object({
  payerUserId: z.string().uuid(),
  payeeUserId: z.string().uuid(),
  amountCents: z.number().int().min(1),
  note: z.string().max(500).optional(),
});

export type LookupUser = z.infer<typeof lookupUserSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;
export type ExpenseDetail = z.infer<typeof expenseDetailSchema>;
export type DeletedExpense = z.infer<typeof deletedExpenseSchema>;
export type Settlement = z.infer<typeof settlementSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementInputSchema>;

export const settlementListItemSchema = settlementSchema.extend({
  groupName: z.string(),
  groupCurrency: z.string(),
});

export const settlementsPageSchema = z.object({
  items: z.array(settlementListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
  stats: z.object({
    totalSettlements: z.number().int(),
    totalAmountCents: z.number().int(),
  }),
  groupOptions: z.array(z.object({ id: z.string().uuid(), name: z.string() })),
});

export type SettlementListItem = z.infer<typeof settlementListItemSchema>;
export type SettlementsPage = z.infer<typeof settlementsPageSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
