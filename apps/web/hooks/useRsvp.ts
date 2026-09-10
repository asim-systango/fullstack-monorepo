import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface RsvpRecord {
  id: string;
  eventId: string;
  userId: string;
  status: 'YES' | 'NO' | 'MAYBE';
  guestCount?: number;
  createdAt: string;
  updatedAt: string;
  ticket?: {
    id: string;
    qrPayload: string;
    status: string;
  };
}

export interface WaitlistRecord {
  id: string;
  eventId: string;
  userId: string;
  position: number;
  status: 'WAITING' | 'PROMOTED' | 'CANCELLED';
  createdAt: string;
}

export interface MyRsvpStatusResponse {
  rsvp: RsvpRecord | null;
  waitlist: WaitlistRecord | null;
}

export interface RsvpActionResult {
  status: 'SUCCESS' | 'WAITLISTED';
  message: string;
  waitlistPosition?: number;
  rsvp?: RsvpRecord;
  ticket?: {
    id: string;
    qrPayload: string;
    status: string;
  };
}

export function useEventRsvp(eventId: string) {
  return useQuery<MyRsvpStatusResponse>({
    queryKey: ['my-rsvp', eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: MyRsvpStatusResponse }>(
        `/events/${eventId}/rsvp/my`,
      );
      return data.data;
    },
    enabled: Boolean(eventId),
  });
}

export function useSubmitRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      status,
      guestCount,
    }: {
      eventId: string;
      status: 'YES' | 'NO' | 'MAYBE';
      guestCount?: number;
    }) => {
      const { data } = await apiClient.post<{ data: RsvpActionResult }>(
        `/events/${eventId}/rsvp`,
        { status, guestCount },
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-rsvp', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-waitlist'] });
    },
  });
}

export function useMyRsvps() {
  return useQuery<Array<RsvpRecord & { event: any; ticket?: any }>>({
    queryKey: ['my-rsvps'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Array<RsvpRecord & { event: any; ticket?: any }> }>(
        '/my-rsvps',
      );
      return data.data;
    },
  });
}
