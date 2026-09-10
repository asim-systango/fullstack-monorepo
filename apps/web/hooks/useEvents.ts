import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  capacity: number;
  organizerId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  category: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  yesCount: number;
  waitlistCount: number;
  spotsLeft: number;
  isFull: boolean;
  isCompleted?: boolean;
}

export interface EventsResponse {
  items: EventItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryEventsParams {
  q?: string;
  category?: string;
  status?: string;
  organizerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  capacity: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  category?: string;
}

export interface AnalyticsResponse {
  eventId: string;
  title: string;
  capacity: number;
  rsvps: {
    yes: number;
    no: number;
    maybe: number;
    total: number;
  };
  waitlistCount: number;
  tickets: {
    issued: number;
    used: number;
    occupancyRate: number;
    checkInRate: number;
  };
}

const EVENTS_QUERY_KEY = 'events';
const MY_ORGANIZED_EVENTS_QUERY_KEY = 'my-organized-events';
const EVENT_QUERY_KEY = 'event';
const ALL_CATEGORY = 'ALL';

export function useEvents(params: QueryEventsParams) {
  const cleanParams: Record<string, string | number> = {};
  if (params.q) cleanParams.q = params.q;
  if (params.category && params.category !== ALL_CATEGORY)
    cleanParams.category = params.category;
  if (params.status && params.status !== ALL_CATEGORY) cleanParams.status = params.status;
  if (params.organizerId) cleanParams.organizerId = params.organizerId;
  if (params.startDate) cleanParams.startDate = params.startDate;
  if (params.endDate) cleanParams.endDate = params.endDate;
  if (params.page) cleanParams.page = params.page;
  if (params.limit) cleanParams.limit = params.limit;

  return useQuery<EventsResponse>({
    queryKey: [EVENTS_QUERY_KEY, cleanParams],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: EventsResponse }>('/events', {
        params: cleanParams,
      });
      return data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useMyOrganizedEvents(params: QueryEventsParams = {}) {
  const cleanParams: Record<string, string | number> = {};
  if (params.q) cleanParams.q = params.q;
  if (params.category && params.category !== ALL_CATEGORY)
    cleanParams.category = params.category;
  if (params.status && params.status !== ALL_CATEGORY) cleanParams.status = params.status;
  if (params.page) cleanParams.page = params.page;
  if (params.limit) cleanParams.limit = params.limit;

  return useQuery<EventsResponse>({
    queryKey: [MY_ORGANIZED_EVENTS_QUERY_KEY, cleanParams],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: EventsResponse }>(
        '/events/organizer/my-events',
        {
          params: cleanParams,
        },
      );
      return data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useEventDetail(id: string) {
  return useQuery<EventItem & { noCount: number; maybeCount: number }>({
    queryKey: [EVENT_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EventItem & { noCount: number; maybeCount: number };
      }>(`/events/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data } = await apiClient.post<{ data: EventItem }>('/events', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_ORGANIZED_EVENTS_QUERY_KEY] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateEventInput>;
    }) => {
      const { data } = await apiClient.patch<{ data: EventItem }>(`/events/${id}`, input);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_ORGANIZED_EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY, variables.id] });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<{ data: EventItem }>(
        `/events/${id}/publish`,
      );
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_ORGANIZED_EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY, id] });
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<{
        data: { success: boolean; message: string };
      }>(`/events/${id}/cancel`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_ORGANIZED_EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<{
        data: { success: boolean; message: string };
      }>(`/events/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_ORGANIZED_EVENTS_QUERY_KEY] });
    },
  });
}

export function useEventAnalytics(id: string) {
  return useQuery<AnalyticsResponse>({
    queryKey: ['event-analytics', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AnalyticsResponse }>(
        `/events/${id}/analytics`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}
