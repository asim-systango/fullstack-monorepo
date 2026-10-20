'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTicketInput, TicketQueryParams } from '@shared/api-client';
import { ticketsApi } from '@/lib/api';

export function useTickets(params?: TicketQueryParams) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketsApi.list(params),
  });
}

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
