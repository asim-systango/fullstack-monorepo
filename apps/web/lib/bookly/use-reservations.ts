'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateReservationInput, ListReservationsParams } from '@shared/types';
import { useAuth } from '@/components/auth';
import { reservationsApi } from '@/lib/api';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateReservationQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

export function useReservations(params?: ListReservationsParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.reservations.list(params),
    queryFn: () => reservationsApi.list(params),
    enabled,
  });
}

export function useMyReservations(params?: ListReservationsParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.user]);
  return useQuery({
    queryKey: queryKeys.reservations.mine(params),
    queryFn: () => reservationsApi.listMine(params),
    enabled,
  });
}

export function useBookReservations(bookId: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.staff]) && Boolean(bookId);
  return useQuery({
    queryKey: queryKeys.reservations.byBook(bookId ?? ''),
    queryFn: () => reservationsApi.listByBook(bookId!),
    enabled,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCreate = hasRole(user, [ROLES.user]);

  return useMutation({
    mutationFn: (input: CreateReservationInput) => {
      if (!canCreate) throw new Error(INSUFFICIENT_PERMISSIONS);
      return reservationsApi.create(input);
    },
    onSuccess: (reservation) => {
      invalidateReservationQueries(queryClient, { bookId: reservation.bookId });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCancel = hasRole(user, [ROLES.user]);

  return useMutation({
    mutationFn: ({ id, bookId }: { id: string; bookId?: string }) => {
      if (!canCancel) throw new Error(INSUFFICIENT_PERMISSIONS);
      return reservationsApi.cancel(id).then(() => bookId);
    },
    onSuccess: (bookId) => {
      invalidateReservationQueries(queryClient, { bookId });
    },
  });
}
