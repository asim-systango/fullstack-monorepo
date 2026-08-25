import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateMessageInput,
  AssignTicketInput,
  UpdateTicketStatusInput,
} from '@shared/api-client';
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

export function useTicketEvents(ticketId: string, enabled = true) {
  return useQuery({
    queryKey: ['ticket-events', ticketId],
    queryFn: () => ticketsApi.getEvents(ticketId),
    enabled: Boolean(ticketId) && enabled,
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

export function useAssignTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignTicketInput) => ticketsApi.assign(ticketId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['ticket-events', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicketStatus(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTicketStatusInput) =>
      ticketsApi.updateStatus(ticketId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['ticket-events', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useDeleteTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketsApi.delete(ticketId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.removeQueries({ queryKey: ['ticket', ticketId] });
    },
  });
}
