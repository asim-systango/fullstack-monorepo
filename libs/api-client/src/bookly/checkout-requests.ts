import type { AxiosInstance } from 'axios';
import {
  checkoutRequestSchema,
  createCheckoutRequestInputSchema,
  issueCheckoutRequestInputSchema,
  listCheckoutRequestsParamsSchema,
  paginatedCheckoutRequestsSchema,
  rejectCheckoutRequestInputSchema,
  type CheckoutRequest,
  type CreateCheckoutRequestInput,
  type IssueCheckoutRequestInput,
  type ListCheckoutRequestsParams,
  type PaginatedCheckoutRequests,
  type RejectCheckoutRequestInput,
} from '@shared/types';
import { unwrapData } from '../unwrap';
import { buildQueryParams } from '../query-params';

function parseCheckoutRequest(data: unknown): CheckoutRequest {
  return checkoutRequestSchema.parse(normalizeCheckoutRequest(data));
}

function parseCheckoutRequestPage(data: unknown): PaginatedCheckoutRequests {
  const page = data as { items?: unknown[] };
  return paginatedCheckoutRequestsSchema.parse({
    ...page,
    items: Array.isArray(page.items) ? page.items.map(normalizeCheckoutRequest) : page.items,
  });
}

function normalizeCheckoutRequest(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const row = raw as Record<string, unknown>;
  const loan = row.loan;
  if (loan && typeof loan === 'object') {
    const loanRow = loan as Record<string, unknown>;
    row.loan = {
      id: loanRow.id,
      borrowedAt: loanRow.borrowedAt,
      dueDate: loanRow.dueDate,
    };
  }
  return row;
}

export function createCheckoutRequestsApi(client: AxiosInstance) {
  return {
    async list(
      params?: ListCheckoutRequestsParams,
      signal?: AbortSignal,
    ): Promise<PaginatedCheckoutRequests> {
      const parsed = listCheckoutRequestsParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/checkout-requests', {
        params: buildQueryParams(parsed),
        signal,
      });
      return parseCheckoutRequestPage(unwrapData(data));
    },

    async listMine(
      params?: ListCheckoutRequestsParams,
    ): Promise<PaginatedCheckoutRequests> {
      const parsed = listCheckoutRequestsParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/my/checkout-requests', {
        params: buildQueryParams(parsed),
      });
      return parseCheckoutRequestPage(unwrapData(data));
    },

    async getById(id: string): Promise<CheckoutRequest> {
      const { data } = await client.get(`/checkout-requests/${id}`);
      return parseCheckoutRequest(unwrapData(data));
    },

    async create(input: CreateCheckoutRequestInput): Promise<CheckoutRequest> {
      const body = createCheckoutRequestInputSchema.parse(input);
      const { data } = await client.post('/checkout-requests', body);
      return parseCheckoutRequest(unwrapData(data));
    },

    async cancel(id: string): Promise<void> {
      await client.delete(`/checkout-requests/${id}`);
    },

    async issue(id: string, input: IssueCheckoutRequestInput): Promise<CheckoutRequest> {
      const body = issueCheckoutRequestInputSchema.parse(input);
      const { data } = await client.post(`/checkout-requests/${id}/issue`, body);
      return parseCheckoutRequest(unwrapData(data));
    },

    async reject(
      id: string,
      input?: RejectCheckoutRequestInput,
    ): Promise<CheckoutRequest> {
      const body = rejectCheckoutRequestInputSchema.parse(input ?? {});
      const { data } = await client.post(`/checkout-requests/${id}/reject`, body);
      return parseCheckoutRequest(unwrapData(data));
    },
  };
}
