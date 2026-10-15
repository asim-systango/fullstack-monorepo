import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelApi } from '../api';

export function useHotels(params: Parameters<typeof hotelApi.getHotels>[0]) {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelApi.getHotels(params),
  });
}

export function useHotel(id: string) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelApi.getHotel(id),
    enabled: !!id,
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hotelApi.createHotel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Parameters<typeof hotelApi.updateHotel>[1];
    }) => hotelApi.updateHotel(id, dto),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['hotels'] });
      void queryClient.invalidateQueries({ queryKey: ['hotels', variables.id] });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hotelApi.deleteHotel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}
