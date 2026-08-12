export const foodKeys = {
  all: ['food'] as const,
  restaurants: (filters?: { cuisine?: string; q?: string; page?: number }) =>
    [...foodKeys.all, 'restaurants', filters] as const,
  myRestaurant: (userId: string) =>
    [...foodKeys.all, 'restaurant', 'mine', userId] as const,
  restaurant: (id: string) => [...foodKeys.all, 'restaurant', id] as const,
  menuItems: (restaurantId: string, includeDeleted?: boolean) =>
    [...foodKeys.all, 'menu-items', restaurantId, includeDeleted] as const,
  menuItem: (id: string) => [...foodKeys.all, 'menu-item', id] as const,
  /** Cart is per user — always pass the logged-in user id. */
  cart: (userId: string) => [...foodKeys.all, 'cart', userId] as const,
  orders: (
    userId: string,
    scope: 'mine' | 'restaurant' | 'all',
    filters?: { status?: string; page?: number },
  ) => [...foodKeys.all, 'orders', userId, scope, filters] as const,
  order: (id: string) => [...foodKeys.all, 'order', id] as const,
};
