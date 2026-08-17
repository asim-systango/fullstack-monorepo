import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api';

export function useBookings(params?: Parameters<typeof bookingApi.getBookings>[0]) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingApi.getBookings(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingApi.getBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.cancelBooking,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['bookings', data.id] });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
