'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEditor,
  fetchAdminUsers,
  updateAdminUser,
  type CreateEditorInput,
  type UpdateAdminUserInput,
} from '@/lib/api/admin';
import { queryKeys } from '@/lib/query';

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: fetchAdminUsers,
  });
}

export function useCreateEditor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEditorInput) => createEditor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdminUserInput) => updateAdminUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}
