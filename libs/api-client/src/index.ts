import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
} from 'axios';
import { z } from 'zod';
import {
  apiErrorSchema,
  balancesSchema,
  deletedExpenseSchema,
  expenseDetailSchema,
  expensePageSchema,
  expenseSchema,
  forgotPasswordInputSchema,
  friendsPageSchema,
  groupDetailSchema,
  groupPageSchema,
  groupSummarySchema,
  invitationSchema,
  invitePreviewSchema,
  lookupUserSchema,
  messageResponseSchema,
  resetPasswordInputSchema,
  resendVerificationInputSchema,
  settlementSchema,
  settlementsPageSchema,
  userSchema,
  verifyEmailInputSchema,
  type ApiErrorBody,
  type Balances,
  type CreateExpenseInput,
  type CreateSettlementInput,
  type DeletedExpense,
  type Expense,
  type ExpenseDetail,
  type ExpensePage,
  type FriendGroupSection,
  type FriendPerson,
  type FriendsPage,
  type GroupDetail,
  type GroupPage,
  type GroupSummary,
  type Invitation,
  type InvitePreview,
  type LookupUser,
  type Settlement,
  type SettlementListItem,
  type SettlementsPage,
  type User,
} from '@shared/types';

export {
  apiErrorSchema,
  balancesSchema,
  deletedExpenseSchema,
  expenseDetailSchema,
  expensePageSchema,
  expenseSchema,
  forgotPasswordInputSchema,
  friendsPageSchema,
  groupDetailSchema,
  groupPageSchema,
  groupSummarySchema,
  invitationSchema,
  invitePreviewSchema,
  lookupUserSchema,
  messageResponseSchema,
  resetPasswordInputSchema,
  resendVerificationInputSchema,
  settlementSchema,
  settlementsPageSchema,
  userSchema,
  verifyEmailInputSchema,
  type ApiErrorBody,
  type Balances,
  type CreateExpenseInput,
  type CreateSettlementInput,
  type DeletedExpense,
  type Expense,
  type ExpenseDetail,
  type ExpensePage,
  type FriendGroupSection,
  type FriendPerson,
  type FriendsPage,
  type GroupDetail,
  type GroupPage,
  type GroupSummary,
  type Invitation,
  type InvitePreview,
  type LookupUser,
  type Settlement,
  type SettlementListItem,
  type SettlementsPage,
  type User,
};

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = body.statusCode;
    this.body = body;
  }
}

function toApiError(error: AxiosError): ApiClientError {
  const data = error.response?.data;
  const parsed = apiErrorSchema.safeParse(data);
  if (parsed.success) {
    return new ApiClientError(parsed.data);
  }
  return new ApiClientError({
    statusCode: error.response?.status ?? 500,
    error: 'UnknownError',
    message: error.message || 'Request failed',
  });
}

/** Unwrap Nest `{ data: T }` success envelope. */
export function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in payload &&
    Object.keys(payload as object).length === 1
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export type CreateApiClientOptions = CreateAxiosDefaults & {
  withCredentials?: boolean;
  onUnauthorized?: () => void;
};

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const { onUnauthorized, ...axiosConfig } = options;
  const client = axios.create({
    timeout: 15_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    ...axiosConfig,
  });

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const apiError = toApiError(error);
      if (apiError.statusCode === 401) {
        const url = error.config?.url ?? '';
        if (
          !url.includes('/auth/me') &&
          !url.includes('/auth/login') &&
          !url.includes('/auth/register')
        ) {
          onUnauthorized?.();
        }
      }
      return Promise.reject(apiError);
    },
  );

  return client;
}

export function createAuthApi(client: AxiosInstance) {
  return {
    async login(input: { email: string; password: string }): Promise<User> {
      const { data } = await client.post('/auth/login', input);
      return userSchema.parse(unwrapData(data));
    },
    async register(input: {
      email: string;
      password: string;
      name: string;
    }): Promise<User> {
      const { data } = await client.post('/auth/register', input);
      return userSchema.parse(unwrapData(data));
    },
    async me(): Promise<User> {
      const { data } = await client.get('/auth/me');
      return userSchema.parse(unwrapData(data));
    },
    async logout(): Promise<void> {
      await client.post('/auth/logout');
    },
    async verifyEmail(input: { token: string }): Promise<User> {
      const { data } = await client.post('/auth/verify-email', input);
      return userSchema.parse(unwrapData(data));
    },
    async resendVerification(input: { email: string }): Promise<{ message: string }> {
      const { data } = await client.post('/auth/resend-verification', input);
      return messageResponseSchema.parse(unwrapData(data));
    },
    async forgotPassword(input: { email: string }): Promise<{ message: string }> {
      const { data } = await client.post('/auth/forgot-password', input);
      return messageResponseSchema.parse(unwrapData(data));
    },
    async resetPassword(input: { token: string; password: string }): Promise<User> {
      const { data } = await client.post('/auth/reset-password', input);
      return userSchema.parse(unwrapData(data));
    },
  };
}

export function createHealthApi(client: AxiosInstance) {
  return {
    async check(): Promise<{ status: string }> {
      const { data } = await client.get('/health');
      const parsed = z.object({ status: z.string() }).parse(unwrapData(data));
      return { status: parsed.status };
    },
  };
}

export function createSplitterApi(client: AxiosInstance) {
  return {
    async listGroups(
      params: {
        limit?: number;
        page?: number;
        q?: string;
        status?:
          | 'all'
          | 'outstanding'
          | 'settled'
          | 'blocked'
          | 'owed_to_me'
          | 'i_owe'
          | 'admin'
          | 'member';
        sortBy?: 'updatedAt' | 'name' | 'balance';
        sortDir?: 'ASC' | 'DESC';
      } = {},
    ): Promise<GroupPage> {
      const { data } = await client.get('/groups', {
        params: {
          limit: params.limit ?? 10,
          page: params.page ?? 1,
          q: params.q || undefined,
          status: params.status && params.status !== 'all' ? params.status : undefined,
          sortBy: params.sortBy || undefined,
          sortDir: params.sortDir || undefined,
        },
      });
      return groupPageSchema.parse(unwrapData(data));
    },
    async listFriends(
      params: {
        limit?: number;
        page?: number;
        q?: string;
        groupId?: string;
        view?: 'groups' | 'people';
      } = {},
    ): Promise<FriendsPage> {
      const { data } = await client.get('/friends', {
        params: {
          limit: params.limit ?? 10,
          page: params.page ?? 1,
          q: params.q || undefined,
          groupId: params.groupId || undefined,
          view: params.view ?? 'groups',
        },
      });
      return friendsPageSchema.parse(unwrapData(data));
    },
    async getGroup(id: string): Promise<GroupDetail> {
      const { data } = await client.get(`/groups/${id}`);
      return groupDetailSchema.parse(unwrapData(data));
    },
    async createGroup(input: { name: string; currency: string }): Promise<GroupSummary> {
      const { data } = await client.post('/groups', input);
      return groupSummarySchema.parse(unwrapData(data));
    },
    async blockGroup(id: string): Promise<GroupSummary> {
      const { data } = await client.post(`/groups/${id}/block`);
      return groupSummarySchema.parse(unwrapData(data));
    },
    async unblockGroup(id: string): Promise<GroupSummary> {
      const { data } = await client.post(`/groups/${id}/unblock`);
      return groupSummarySchema.parse(unwrapData(data));
    },
    async removeMember(groupId: string, userId: string): Promise<{ message: string }> {
      const { data } = await client.delete(`/groups/${groupId}/members/${userId}`);
      return messageResponseSchema.parse(unwrapData(data));
    },
    async lookupUser(email: string): Promise<LookupUser> {
      const { data } = await client.get('/users/lookup', { params: { email } });
      return lookupUserSchema.parse(unwrapData(data));
    },
    async sendInvite(groupId: string, email: string): Promise<Invitation> {
      const { data } = await client.post(`/groups/${groupId}/invites`, { email });
      return invitationSchema.parse(unwrapData(data));
    },
    async listGroupInvites(groupId: string): Promise<Invitation[]> {
      const { data } = await client.get(`/groups/${groupId}/invites`);
      return z.array(invitationSchema).parse(unwrapData(data));
    },
    async listMyInvites(): Promise<Invitation[]> {
      const { data } = await client.get('/invites/me');
      return z.array(invitationSchema).parse(unwrapData(data));
    },
    async previewInvite(token: string): Promise<InvitePreview> {
      const { data } = await client.get('/invites/preview', { params: { token } });
      return invitePreviewSchema.parse(unwrapData(data));
    },
    async acceptInviteByToken(token: string): Promise<GroupDetail> {
      const { data } = await client.post('/invites/accept', { token });
      return groupDetailSchema.parse(unwrapData(data));
    },
    async acceptInvite(id: string): Promise<GroupDetail> {
      const { data } = await client.post(`/invites/${id}/accept`);
      return groupDetailSchema.parse(unwrapData(data));
    },
    async declineInvite(id: string): Promise<{ message: string }> {
      const { data } = await client.post(`/invites/${id}/decline`);
      return messageResponseSchema.parse(unwrapData(data));
    },
    async listExpenses(
      groupId: string,
      params: {
        limit?: number;
        page?: number;
        from?: string;
        to?: string;
        payerUserId?: string;
        q?: string;
        category?: string;
        sortBy?: 'expenseDate' | 'amountCents' | 'description';
        sortDir?: 'ASC' | 'DESC';
      } = {},
    ): Promise<ExpensePage> {
      const { data } = await client.get(`/groups/${groupId}/expenses`, {
        params: {
          limit: params.limit ?? 10,
          page: params.page ?? 1,
          from: params.from || undefined,
          to: params.to || undefined,
          payerUserId: params.payerUserId || undefined,
          q: params.q || undefined,
          category: params.category || undefined,
          sortBy: params.sortBy || undefined,
          sortDir: params.sortDir || undefined,
        },
      });
      return expensePageSchema.parse(unwrapData(data));
    },
    async getExpense(groupId: string, expenseId: string): Promise<ExpenseDetail> {
      const { data } = await client.get(`/groups/${groupId}/expenses/${expenseId}`);
      return expenseDetailSchema.parse(unwrapData(data));
    },
    async createExpense(
      groupId: string,
      input: CreateExpenseInput,
    ): Promise<ExpenseDetail> {
      const { data } = await client.post(`/groups/${groupId}/expenses`, input);
      return expenseDetailSchema.parse(unwrapData(data));
    },
    async updateExpense(
      groupId: string,
      expenseId: string,
      input: CreateExpenseInput,
    ): Promise<ExpenseDetail> {
      const { data } = await client.patch(
        `/groups/${groupId}/expenses/${expenseId}`,
        input,
      );
      return expenseDetailSchema.parse(unwrapData(data));
    },
    async deleteExpense(
      groupId: string,
      expenseId: string,
    ): Promise<{ message: string }> {
      const { data } = await client.delete(`/groups/${groupId}/expenses/${expenseId}`);
      return messageResponseSchema.parse(unwrapData(data));
    },
    async listDeletedExpenses(groupId: string): Promise<DeletedExpense[]> {
      const { data } = await client.get(`/groups/${groupId}/expenses/deleted`);
      return z.array(deletedExpenseSchema).parse(unwrapData(data));
    },
    async getBalances(groupId: string): Promise<Balances> {
      const { data } = await client.get(`/groups/${groupId}/balances`);
      return balancesSchema.parse(unwrapData(data));
    },
    async listSettlements(groupId: string): Promise<Settlement[]> {
      const { data } = await client.get(`/groups/${groupId}/settlements`);
      return z.array(settlementSchema).parse(unwrapData(data));
    },
    async listAllSettlements(
      params: {
        limit?: number;
        page?: number;
        q?: string;
        groupId?: string;
      } = {},
    ): Promise<SettlementsPage> {
      const { data } = await client.get('/settlements', {
        params: {
          limit: params.limit ?? 10,
          page: params.page ?? 1,
          q: params.q || undefined,
          groupId: params.groupId || undefined,
        },
      });
      return settlementsPageSchema.parse(unwrapData(data));
    },
    async createSettlement(
      groupId: string,
      input: CreateSettlementInput,
    ): Promise<Settlement> {
      const { data } = await client.post(`/groups/${groupId}/settlements`, input);
      return settlementSchema.parse(unwrapData(data));
    },
  };
}
