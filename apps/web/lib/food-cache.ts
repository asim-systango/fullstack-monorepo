import type { QueryClient } from '@tanstack/react-query';

export function clearUserFoodCache(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ['food', 'cart'] });
  queryClient.removeQueries({ queryKey: ['food', 'orders'] });
}
