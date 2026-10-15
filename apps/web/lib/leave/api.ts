import { unwrapData } from '@shared/api-client';
import { apiClient } from '../api';
import type {
  Balance,
  LeaveRequest,
  LeaveType,
  MyRequestsQuery,
  NewLeaveRequest,
  Paginated,
  Quote,
} from './types';

const REQUESTS = '/leave-requests';

async function get<T>(url: string, params?: object): Promise<T> {
  const response = await apiClient.get<unknown>(url, { params });
  return unwrapData<T>(response.data);
}

async function post<T>(url: string, body?: object): Promise<T> {
  const response = await apiClient.post<unknown>(url, body);
  return unwrapData<T>(response.data);
}

async function remove<T>(url: string): Promise<T> {
  const response = await apiClient.delete<unknown>(url);
  return unwrapData<T>(response.data);
}

export const leaveApi = {
  leaveTypes: () => get<LeaveType[]>('/leave-types'),
  myBalances: () => get<Balance[]>('/balances/me'),
  myRequests: (query: MyRequestsQuery) =>
    get<Paginated<LeaveRequest>>(`${REQUESTS}/me`, query),
  request: (id: string) => get<LeaveRequest>(`${REQUESTS}/${id}`),
  quote: (startDate: string, endDate: string) =>
    get<Quote>(`${REQUESTS}/quote`, { startDate, endDate }),
  apply: (body: NewLeaveRequest) => post<LeaveRequest>(REQUESTS, body),
  cancel: (id: string) => post<LeaveRequest>(`${REQUESTS}/${id}/cancel`),
  remove: (id: string) => remove<{ id: string; deleted: boolean }>(`${REQUESTS}/${id}`),
};
