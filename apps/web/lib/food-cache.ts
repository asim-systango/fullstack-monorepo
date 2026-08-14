import type { QueryClient } from '@tanstack/react-query';

export function clearUserFoodCache(queryClient: QueryClient) {
  void queryClient.removeQueries({ queryKey: ['food', 'cart'] });
  void queryClient.removeQueries({ queryKey: ['food', 'orders'] });
}
