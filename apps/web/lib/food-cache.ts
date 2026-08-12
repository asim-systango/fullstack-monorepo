import type { QueryClient } from '@tanstack/react-query';

/** Remove cart + orders cache when user logs in or out. */
export function clearUserFoodCache(queryClient: QueryClient) {
  void queryClient.removeQueries({ queryKey: ['food', 'cart'] });
  void queryClient.removeQueries({ queryKey: ['food', 'orders'] });
}
