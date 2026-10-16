'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth';
import { dashboardApi } from '@/lib/api';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { queryKeys } from '@/lib/query-keys';

export function usePublicDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.public,
    queryFn: () => dashboardApi.publicStats(),
  });
}

export function useMemberDashboard() {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.user]);
  return useQuery({
    queryKey: queryKeys.dashboard.member,
    queryFn: () => dashboardApi.member(),
    enabled,
  });
}

export function useLibrarianDashboard() {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.staff]);
  return useQuery({
    queryKey: queryKeys.dashboard.librarian,
    queryFn: () => dashboardApi.librarian(),
    enabled,
  });
}

export function useAdminDashboard() {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.admin]);
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: () => dashboardApi.admin(),
    enabled,
  });
}
