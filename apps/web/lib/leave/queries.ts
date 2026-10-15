'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { leaveApi } from './api';
import { isYmd } from './dates';
import type { MyRequestsQuery, TeamRequestsQuery } from './types';

export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  myBalances: () => [...leaveKeys.all, 'balances', 'me'] as const,
  myRequests: (query: MyRequestsQuery) =>
    [...leaveKeys.all, 'requests', 'me', query] as const,
  request: (id: string) => [...leaveKeys.all, 'request', id] as const,
  quote: (startDate: string, endDate: string) =>
    [...leaveKeys.all, 'quote', startDate, endDate] as const,
  teamRequests: (query: TeamRequestsQuery) =>
    [...leaveKeys.all, 'requests', 'team', query] as const,
  employees: () => [...leaveKeys.all, 'employees'] as const,
  employeeBalances: (userId: string, year: number) =>
    [...leaveKeys.all, 'balances', userId, year] as const,
};

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: leaveApi.leaveTypes,
    staleTime: 5 * 60_000,
  });
}

export function useMyBalances() {
  return useQuery({ queryKey: leaveKeys.myBalances(), queryFn: leaveApi.myBalances });
}

export function useMyRequests(query: MyRequestsQuery) {
  return useQuery({
    queryKey: leaveKeys.myRequests(query),
    queryFn: () => leaveApi.myRequests(query),
    // keep the old page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: leaveKeys.request(id),
    queryFn: () => leaveApi.request(id),
  });
}

export function useQuote(startDate: string, endDate: string) {
  const enabled = isYmd(startDate) && isYmd(endDate) && endDate >= startDate;
  return useQuery({
    queryKey: leaveKeys.quote(startDate, endDate),
    queryFn: () => leaveApi.quote(startDate, endDate),
    enabled,
    staleTime: 60_000,
  });
}

// small app: after any change, refetch everything leave related (lists, details, balances)
export function useLeaveMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export const useApplyLeave = () => useLeaveMutation(leaveApi.apply);
export const useCancelRequest = () => useLeaveMutation(leaveApi.cancel);
export const useRemoveRequest = () => useLeaveMutation(leaveApi.remove);

export function useTeamRequests(query: TeamRequestsQuery, enabled = true) {
  return useQuery({
    queryKey: leaveKeys.teamRequests(query),
    queryFn: () => leaveApi.teamRequests(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: leaveKeys.employees(),
    queryFn: leaveApi.employees,
    staleTime: 5 * 60_000,
  });
}

export function useEmployeeBalances(userId: string, year: number) {
  return useQuery({
    queryKey: leaveKeys.employeeBalances(userId, year),
    queryFn: () => leaveApi.employeeBalances(userId, year),
    enabled: Boolean(userId),
  });
}

// approve/reject also refresh after an error: if someone else just decided it, the list shows that
function useDecisionMutation(mutationFn: typeof leaveApi.approve) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export const useApproveRequest = () => useDecisionMutation(leaveApi.approve);
export const useRejectRequest = () => useDecisionMutation(leaveApi.reject);
export const useCreateLeaveType = () => useLeaveMutation(leaveApi.createLeaveType);
export const useUpdateLeaveType = () => useLeaveMutation(leaveApi.updateLeaveType);
export const useArchiveLeaveType = () => useLeaveMutation(leaveApi.archiveLeaveType);
export const useSetBalance = () => useLeaveMutation(leaveApi.setBalance);
