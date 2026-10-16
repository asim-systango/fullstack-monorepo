import { unwrapData } from '@shared/api-client';
import { apiClient } from '../api';
import type {
  Balance,
  BalanceInput,
  Employee,
  Holiday,
  HolidayInput,
  LeaveRequest,
  LeaveType,
  LeaveTypeInput,
  MyRequestsQuery,
  NewLeaveRequest,
  Paginated,
  Quote,
  TeamRequestsQuery,
  WhosAway,
} from './types';

const REQUESTS = '/leave-requests';
const LEAVE_TYPES = '/leave-types';

async function get<T>(url: string, params?: object): Promise<T> {
  const response = await apiClient.get<unknown>(url, { params });
  return unwrapData<T>(response.data);
}

async function post<T>(url: string, body?: object): Promise<T> {
  const response = await apiClient.post<unknown>(url, body);
  return unwrapData<T>(response.data);
}

async function patch<T>(url: string, body: object): Promise<T> {
  const response = await apiClient.patch<unknown>(url, body);
  return unwrapData<T>(response.data);
}

async function put<T>(url: string, body: object): Promise<T> {
  const response = await apiClient.put<unknown>(url, body);
  return unwrapData<T>(response.data);
}

async function remove<T>(url: string): Promise<T> {
  const response = await apiClient.delete<unknown>(url);
  return unwrapData<T>(response.data);
}

export type Decision = { id: string; comment?: string };

export const leaveApi = {
  leaveTypes: () => get<LeaveType[]>(LEAVE_TYPES),
  myBalances: () => get<Balance[]>('/balances/me'),
  myRequests: (query: MyRequestsQuery) =>
    get<Paginated<LeaveRequest>>(`${REQUESTS}/me`, query),
  request: (id: string) => get<LeaveRequest>(`${REQUESTS}/${id}`),
  quote: (startDate: string, endDate: string) =>
    get<Quote>(`${REQUESTS}/quote`, { startDate, endDate }),
  apply: (body: NewLeaveRequest) => post<LeaveRequest>(REQUESTS, body),
  cancel: (id: string) => post<LeaveRequest>(`${REQUESTS}/${id}/cancel`),
  remove: (id: string) => remove<{ id: string; deleted: boolean }>(`${REQUESTS}/${id}`),

  // managers and admins
  teamRequests: (query: TeamRequestsQuery) =>
    get<Paginated<LeaveRequest>>(REQUESTS, query),
  approve: ({ id, comment }: Decision) =>
    post<LeaveRequest>(`${REQUESTS}/${id}/approve`, comment ? { comment } : {}),
  reject: ({ id, comment }: Decision) =>
    post<LeaveRequest>(`${REQUESTS}/${id}/reject`, { comment }),
  employees: () => get<Employee[]>('/employees'),
  away: (from: string) => get<WhosAway>(`${REQUESTS}/away`, { from }),

  // admin
  createLeaveType: (body: LeaveTypeInput) => post<LeaveType>(LEAVE_TYPES, body),
  updateLeaveType: ({ id, ...body }: LeaveTypeInput & { id: string }) =>
    patch<LeaveType>(`${LEAVE_TYPES}/${id}`, body),
  archiveLeaveType: (id: string) =>
    remove<{ id: string; archived: boolean }>(`${LEAVE_TYPES}/${id}`),
  employeeBalances: (userId: string, year: number) =>
    get<Balance[]>('/balances', { userId, year }),
  setBalance: (body: BalanceInput) => put<Balance>('/balances', body),
  holidays: (year: number) => get<Holiday[]>('/holidays', { year }),
  createHoliday: (body: HolidayInput) => post<Holiday>('/holidays', body),
  deleteHoliday: (id: string) =>
    remove<{ id: string; deleted: boolean }>(`/holidays/${id}`),
};
