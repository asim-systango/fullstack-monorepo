export const foodKeys = {
  all: ['food'] as const,
  restaurants: (filters?: { cuisine?: string; q?: string; page?: number }) =>
    [...foodKeys.all, 'restaurants', filters] as const,
  restaurant: (id: string) => [...foodKeys.all, 'restaurant', id] as const,
  menuItems: (restaurantId: string, includeDeleted?: boolean) =>
    [...foodKeys.all, 'menu-items', restaurantId, includeDeleted] as const,
  menuItem: (id: string) => [...foodKeys.all, 'menu-item', id] as const,
  cart: () => [...foodKeys.all, 'cart'] as const,
  orders: (filters?: { status?: string; page?: number }, role?: string) =>
    [...foodKeys.all, 'orders', filters, role] as const,
  order: (id: string) => [...foodKeys.all, 'order', id] as const,
};
