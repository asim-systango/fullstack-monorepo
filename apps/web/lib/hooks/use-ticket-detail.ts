import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateMessageInput } from '@shared/api-client';
import { ticketsApi } from '@/lib/api';

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => ticketsApi.getMessages(ticketId),
    enabled: Boolean(ticketId),
  });
}

export function useCreateMessage(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMessageInput) => ticketsApi.createMessage(ticketId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
