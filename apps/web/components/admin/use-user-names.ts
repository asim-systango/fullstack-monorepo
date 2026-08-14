'use client';

import { useMemo } from 'react';
import { useAdminUsers } from '@/hooks/use-admin';

/**
 * Articles and comments carry an opaque gateway user id — the domain API
 * deliberately has no users table. Admins can read the gateway user list, so
 * names are resolved here, falling back to a short id while that request is in
 * flight or if the account has since been removed.
 */
export function useUserNames(): (userId: string) => string {
  const { data } = useAdminUsers();

  return useMemo(() => {
    const names = new Map(data?.users.map((user) => [user.id, user.name]) ?? []);
    return (userId: string) => names.get(userId) ?? `${userId.slice(0, 8)}…`;
  }, [data]);
}
