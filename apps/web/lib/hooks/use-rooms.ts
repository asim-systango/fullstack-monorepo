import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi, availabilityApi } from '../api';

export function useRooms(hotelId: string) {
  return useQuery({
    queryKey: ['rooms', 'hotel', hotelId],
    queryFn: () => roomApi.getRooms(hotelId),
    enabled: !!hotelId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hotelId,
      dto,
    }: {
      hotelId: string;
      dto: Parameters<typeof roomApi.createRoom>[1];
    }) => roomApi.createRoom(hotelId, dto),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['rooms', 'hotel', variables.hotelId],
      });
      void queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string;
      hotelId: string;
      dto: Parameters<typeof roomApi.updateRoom>[1];
    }) => roomApi.updateRoom(variables.id, variables.dto),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['rooms', 'hotel', variables.hotelId],
      });
      void queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; hotelId: string }) =>
      roomApi.deleteRoom(variables.id),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['rooms', 'hotel', variables.hotelId],
      });
      void queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId] });
    },
  });
}

export function useAvailability(
  params: Parameters<typeof availabilityApi.checkAvailability>[0],
) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => availabilityApi.checkAvailability(params),
    enabled: !!params.checkIn && !!params.checkOut,
  });
}
