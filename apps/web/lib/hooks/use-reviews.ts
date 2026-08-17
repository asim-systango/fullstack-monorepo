import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api';

export function useReviews(hotelId: string) {
  return useQuery({
    queryKey: ['reviews', 'hotel', hotelId],
    queryFn: () => reviewApi.getReviews(hotelId),
    enabled: !!hotelId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ['reviews', 'hotel', data.hotelId],
      });
      void queryClient.invalidateQueries({ queryKey: ['hotels', data.hotelId] });
    },
  });
}
