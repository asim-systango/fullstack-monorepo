import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface TicketItem {
  id: string;
  rsvpId: string;
  eventId: string;
  userId: string;
  qrPayload: string;
  status: 'ISSUED' | 'USED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    category: string;
  };
  checkIns?: Array<{
    id: string;
    scannedAt: string;
    scannedByUserId: string;
  }>;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  ticket: {
    id: string;
    status: string;
    qrPayload: string;
    userId: string;
  };
  event: {
    id: string;
    title: string;
    location: string;
  };
  checkIn: {
    id: string;
    scannedAt: string;
    scannedByUserId: string;
  };
}

export function useMyTickets() {
  return useQuery<TicketItem[]>({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TicketItem[] }>('/tickets');
      return data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useCheckInTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (qrPayload: string) => {
      const { data } = await apiClient.post<{ data: CheckInResponse }>(
        '/tickets/check-in',
        { qrPayload },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-analytics'] });
    },
  });
}

export interface WaitlistEntryItem {
  id: string;
  eventId: string;
  userId: string;
  position: number;
  status: 'WAITING' | 'PROMOTED' | 'CANCELLED';
  createdAt: string;
  event?: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    category: string;
  };
}

export function useMyWaitlist() {
  return useQuery<WaitlistEntryItem[]>({
    queryKey: ['my-waitlist'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: WaitlistEntryItem[] }>('/my-waitlist');
      return data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
