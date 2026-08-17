'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/types';
import { useAuth } from '@/components/auth';
import { usersApi } from '@/lib/api';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateMemberQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCreate = hasRole(user, [ROLES.admin]);

  return useMutation({
    mutationFn: (input: { name: string; email: string }) => {
      if (!canCreate) throw new Error(INSUFFICIENT_PERMISSIONS);
      return usersApi.create(input);
    },
    onSuccess: () => {
      invalidateMemberQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canUpdate = hasRole(user, [ROLES.admin]);

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: User['role'] }) => {
      if (!canUpdate) throw new Error(INSUFFICIENT_PERMISSIONS);
      return usersApi.updateRole(id, { role });
    },
    onSuccess: (updated) => {
      invalidateMemberQueries(queryClient, updated.id);
    },
  });
}
