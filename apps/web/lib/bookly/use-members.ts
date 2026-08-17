'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListMembersParams, SuspendMemberInput } from '@shared/types';
import { useAuth } from '@/components/auth';
import { membersApi } from '@/lib/api';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateMemberQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useMembers(params?: ListMembersParams, options?: { enabled?: boolean }) {
  const { user } = useAuth();
  const enabled =
    (options?.enabled ?? true) && hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.members.list(params),
    queryFn: ({ signal }) => membersApi.list(params, signal),
    enabled,
  });
}

export function useMemberSearch(q: string) {
  const { user } = useAuth();
  const term = q.trim();
  const enabled = hasRole(user, LIBRARIAN_ROLES) && term.length > 0;
  return useQuery({
    queryKey: queryKeys.members.search(term),
    queryFn: ({ signal }) => membersApi.search({ q: term }, signal),
    enabled,
  });
}

export function useMember(userId: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES) && Boolean(userId);
  return useQuery({
    queryKey: queryKeys.members.detail(userId ?? ''),
    queryFn: () => membersApi.getByUserId(userId!),
    enabled,
  });
}

export function useMemberLoanSummary(userId: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES) && Boolean(userId);
  return useQuery({
    queryKey: queryKeys.members.loanSummary(userId ?? ''),
    queryFn: () => membersApi.loanSummary(userId!),
    enabled,
  });
}

export function useSuspendMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canSuspend = hasRole(user, [ROLES.admin]);

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: SuspendMemberInput }) => {
      if (!canSuspend) throw new Error(INSUFFICIENT_PERMISSIONS);
      return membersApi.suspend(userId, input);
    },
    onSuccess: (profile) => invalidateMemberQueries(queryClient, profile.userId),
  });
}

export function useReinstateMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canReinstate = hasRole(user, [ROLES.admin]);

  return useMutation({
    mutationFn: (userId: string) => {
      if (!canReinstate) throw new Error(INSUFFICIENT_PERMISSIONS);
      return membersApi.reinstate(userId);
    },
    onSuccess: (profile) => invalidateMemberQueries(queryClient, profile.userId),
  });
}
