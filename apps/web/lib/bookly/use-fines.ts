'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListFinesParams, WaiveFineInput } from '@shared/types';
import { useAuth } from '@/components/auth';
import { finesApi } from '@/lib/api';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateFineQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useFines(params?: ListFinesParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.fines.list(params),
    queryFn: () => finesApi.list(params),
    enabled,
  });
}

export function useFine(id: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES) && Boolean(id);
  return useQuery({
    queryKey: queryKeys.fines.detail(id ?? ''),
    queryFn: () => finesApi.getById(id!),
    enabled,
  });
}

export function useMyFines(params?: ListFinesParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.user]);
  return useQuery({
    queryKey: queryKeys.fines.mine(params),
    queryFn: () => finesApi.listMine(params),
    enabled,
  });
}

export function usePayFine() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canPay = hasRole(user, LIBRARIAN_ROLES);

  return useMutation({
    mutationFn: (id: string) => {
      if (!canPay) throw new Error(INSUFFICIENT_PERMISSIONS);
      return finesApi.pay(id);
    },
    onSuccess: (fine) => invalidateFineQueries(queryClient, fine.id),
  });
}

export function useWaiveFine() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWaive = hasRole(user, LIBRARIAN_ROLES);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WaiveFineInput }) => {
      if (!canWaive) throw new Error(INSUFFICIENT_PERMISSIONS);
      return finesApi.waive(id, input);
    },
    onSuccess: (fine) => invalidateFineQueries(queryClient, fine.id),
  });
}
