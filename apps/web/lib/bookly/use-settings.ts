'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateSettingInput } from '@shared/types';
import { useAuth } from '@/components/auth';
import { settingsApi } from '@/lib/api';
import { canManageSettings } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateSettingsQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useSettings() {
  const { user } = useAuth();
  const enabled = canManageSettings(user);
  return useQuery({
    queryKey: queryKeys.settings.list(),
    queryFn: () => settingsApi.list(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const allowed = canManageSettings(user);

  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: UpdateSettingInput }) => {
      if (!allowed) throw new Error(INSUFFICIENT_PERMISSIONS);
      return settingsApi.update(key, input);
    },
    onSuccess: (setting) => invalidateSettingsQueries(queryClient, setting.key),
  });
}
