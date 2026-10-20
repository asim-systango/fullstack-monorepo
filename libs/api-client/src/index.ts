import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
} from 'axios';
import { z } from 'zod';
import {
  apiErrorSchema,
  userSchema,
  ticketSchema,
  categorySchema,
  messageSchema,
  createMessageSchema,
  paginatedTicketsResponseSchema,
  ticketEventSchema,
  notificationSchema,
  type ApiErrorBody,
  type User,
  type Ticket,
  type Category,
  type Message,
  type TicketPriority,
  type TicketStatus,
  type CreateTicketInput,
  type CreateMessageInput,
  type PaginatedTicketsResponse,
  type TicketQueryParams,
  type AssignTicketInput,
  type UpdateTicketStatusInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type TicketEvent,
  type Notification,
} from '@shared/types';

export {
  apiErrorSchema,
  userSchema,
  ticketSchema,
  categorySchema,
  messageSchema,
  createMessageSchema,
  paginatedTicketsResponseSchema,
  ticketEventSchema,
  notificationSchema,
  type ApiErrorBody,
  type User,
  type Ticket,
  type Category,
  type Message,
  type TicketPriority,
  type TicketStatus,
  type CreateTicketInput,
  type CreateMessageInput,
  type PaginatedTicketsResponse,
  type TicketQueryParams,
  type AssignTicketInput,
  type UpdateTicketStatusInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type TicketEvent,
  type Notification,
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

export function createTicketsApi(client: AxiosInstance) {
  return {
    async list(params?: TicketQueryParams): Promise<PaginatedTicketsResponse> {
      const { data } = await client.get('/tickets', { params });
      return paginatedTicketsResponseSchema.parse(unwrapData(data));
    },
    async getById(id: string): Promise<Ticket> {
      const { data } = await client.get(`/tickets/${id}`);
      return ticketSchema.parse(unwrapData(data));
    },
    async create(input: CreateTicketInput): Promise<Ticket> {
      const { data } = await client.post('/tickets', input);
      return ticketSchema.parse(unwrapData(data));
    },
    async assign(id: string, input: AssignTicketInput): Promise<Ticket> {
      const { data } = await client.patch(`/tickets/${id}/assign`, input);
      return ticketSchema.parse(unwrapData(data));
    },
    async updateStatus(id: string, input: UpdateTicketStatusInput): Promise<Ticket> {
      const { data } = await client.patch(`/tickets/${id}/status`, input);
      return ticketSchema.parse(unwrapData(data));
    },
    async delete(
      id: string,
    ): Promise<{ id: string; deletedAt: string; deletedBy: string }> {
      const { data } = await client.delete(`/tickets/${id}`);
      return unwrapData(data);
    },
    async getMessages(ticketId: string): Promise<Message[]> {
      const { data } = await client.get(`/tickets/${ticketId}/messages`);
      const unwrapped = unwrapData<Message[]>(data);
      return z.array(messageSchema).parse(unwrapped);
    },
    async createMessage(ticketId: string, input: CreateMessageInput): Promise<Message> {
      const { data } = await client.post(`/tickets/${ticketId}/messages`, input);
      return messageSchema.parse(unwrapData(data));
    },
    async getEvents(ticketId: string): Promise<TicketEvent[]> {
      const { data } = await client.get(`/tickets/${ticketId}/events`);
      const unwrapped = unwrapData<TicketEvent[]>(data);
      return z.array(ticketEventSchema).parse(unwrapped);
    },
  };
}

export function createCategoriesApi(client: AxiosInstance) {
  return {
    async list(): Promise<Category[]> {
      const { data } = await client.get('/categories');
      const unwrapped = unwrapData<Category[]>(data);
      return z.array(categorySchema).parse(unwrapped);
    },
    async create(input: CreateCategoryInput): Promise<Category> {
      const { data } = await client.post('/categories', input);
      return categorySchema.parse(unwrapData(data));
    },
    async update(id: string, input: UpdateCategoryInput): Promise<Category> {
      const { data } = await client.patch(`/categories/${id}`, input);
      return categorySchema.parse(unwrapData(data));
    },
    async delete(id: string): Promise<{ success: boolean; id: string }> {
      const { data } = await client.delete(`/categories/${id}`);
      return unwrapData(data);
    },
  };
}

export function createNotificationsApi(client: AxiosInstance) {
  return {
    async list(): Promise<Notification[]> {
      const { data } = await client.get('/notifications');
      const unwrapped = unwrapData<Notification[]>(data);
      return z.array(notificationSchema).parse(unwrapped);
    },
    async markAsRead(id: string): Promise<Notification> {
      const { data } = await client.patch(`/notifications/${id}/read`);
      return notificationSchema.parse(unwrapData(data));
    },
  };
}
