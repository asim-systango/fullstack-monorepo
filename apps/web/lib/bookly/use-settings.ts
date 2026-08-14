'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateSettingInput } from '@shared/types';
import { useAuth } from '@/components/auth';
import { settingsApi } from '@/lib/api';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateSettingsQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useSettings() {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.admin]);
  return useQuery({
    queryKey: queryKeys.settings.list(),
    queryFn: () => settingsApi.list(),
    enabled,
  });
}

export function useSetting(key: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.admin]) && Boolean(key);
  return useQuery({
    queryKey: queryKeys.settings.detail(key ?? ''),
    queryFn: () => settingsApi.getByKey(key!),
    enabled,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canUpdate = hasRole(user, [ROLES.admin]);

  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: UpdateSettingInput }) => {
      if (!canUpdate) throw new Error(INSUFFICIENT_PERMISSIONS);
      return settingsApi.update(key, input);
    },
    onSuccess: (setting) => invalidateSettingsQueries(queryClient, setting.key),
  });
}
