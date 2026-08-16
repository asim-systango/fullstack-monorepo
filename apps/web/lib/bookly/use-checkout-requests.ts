'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateCheckoutRequestInput,
  IssueCheckoutRequestInput,
  ListCheckoutRequestsParams,
  RejectCheckoutRequestInput,
} from '@shared/types';
import { useAuth } from '@/components/auth';
import { checkoutRequestsApi } from '@/lib/api';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import {
  invalidateAfterCheckout,
  invalidateCheckoutRequestQueries,
} from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useCheckoutRequests(
  params?: ListCheckoutRequestsParams,
  options?: { enabled?: boolean },
) {
  const { user } = useAuth();
  const enabled = (options?.enabled ?? true) && hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.checkoutRequests.list(params),
    queryFn: ({ signal }) => checkoutRequestsApi.list(params, signal),
    enabled,
  });
}

export function useMyCheckoutRequests(params?: ListCheckoutRequestsParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.user]);
  return useQuery({
    queryKey: queryKeys.checkoutRequests.mine(params),
    queryFn: () => checkoutRequestsApi.listMine(params),
    enabled,
  });
}

export function useCheckoutRequest(id: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES) && Boolean(id);
  return useQuery({
    queryKey: queryKeys.checkoutRequests.detail(id ?? ''),
    queryFn: () => checkoutRequestsApi.getById(id!),
    enabled,
  });
}

export function useCreateCheckoutRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCreate = hasRole(user, [ROLES.user]);

  return useMutation({
    mutationFn: (input: CreateCheckoutRequestInput) => {
      if (!canCreate) throw new Error(INSUFFICIENT_PERMISSIONS);
      return checkoutRequestsApi.create(input);
    },
    onSuccess: (request) => {
      invalidateCheckoutRequestQueries(queryClient, { bookId: request.bookId });
    },
  });
}

export function useCancelCheckoutRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCancel = hasRole(user, [ROLES.user]);

  return useMutation({
    mutationFn: ({ id, bookId }: { id: string; bookId?: string }) => {
      if (!canCancel) throw new Error(INSUFFICIENT_PERMISSIONS);
      return checkoutRequestsApi.cancel(id).then(() => bookId);
    },
    onSuccess: (bookId) => {
      invalidateCheckoutRequestQueries(queryClient, { bookId });
    },
  });
}

export function useIssueCheckoutRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canIssue = hasRole(user, [ROLES.staff]);

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: IssueCheckoutRequestInput;
    }) => {
      if (!canIssue) throw new Error(INSUFFICIENT_PERMISSIONS);
      return checkoutRequestsApi.issue(id, input);
    },
    onSuccess: (request) => {
      invalidateAfterCheckout(queryClient, { bookId: request.bookId });
      invalidateCheckoutRequestQueries(queryClient, {
        bookId: request.bookId,
        requestId: request.id,
      });
    },
  });
}

export function useRejectCheckoutRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canReject = hasRole(user, [ROLES.staff]);

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input?: RejectCheckoutRequestInput;
    }) => {
      if (!canReject) throw new Error(INSUFFICIENT_PERMISSIONS);
      return checkoutRequestsApi.reject(id, input);
    },
    onSuccess: (request) => {
      invalidateCheckoutRequestQueries(queryClient, {
        bookId: request.bookId,
        requestId: request.id,
      });
    },
  });
}
