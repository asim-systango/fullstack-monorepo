'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '@/lib/food-api';
import { foodKeys } from '@/lib/query-keys';
import { useAppSelector } from '@/lib/store';

export function useRestaurants(page = 1) {
  const cuisine = useAppSelector((s) => s.filters.restaurantCuisineApplied);
  const q = useAppSelector((s) => s.filters.restaurantSearchApplied);

  return useQuery({
    queryKey: foodKeys.restaurants({ cuisine, q, page }),
    queryFn: () => foodApi.listRestaurants({ cuisine: cuisine || undefined, q: q || undefined, page }),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: foodKeys.restaurant(id),
    queryFn: () => foodApi.getRestaurant(id),
    enabled: Boolean(id),
  });
}

export function useMenuItems(restaurantId: string, includeDeleted = false) {
  return useQuery({
    queryKey: foodKeys.menuItems(restaurantId, includeDeleted),
    queryFn: () => foodApi.listMenuItems(restaurantId, includeDeleted),
    enabled: Boolean(restaurantId),
  });
}

export function useCart() {
  return useQuery({
    queryKey: foodKeys.cart(),
    queryFn: () => foodApi.getCart(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, quantity }: { menuItemId: string; quantity?: number }) =>
      foodApi.addToCart(menuItemId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.cart() });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      foodApi.updateCartItem(cartItemId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.cart() });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => foodApi.clearCart(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.cart() });
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foodApi.placeOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.cart() });
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}

export function useOrders(role?: 'admin' | 'staff' | 'user', page = 1) {
  const status = useAppSelector((s) => s.filters.orderStatusApplied);

  return useQuery({
    queryKey: foodKeys.orders({ status, page }, role),
    queryFn: () => foodApi.listOrders({ status: status || undefined, page }, role),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: foodKeys.order(id),
    queryFn: () => foodApi.getOrder(id),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Parameters<typeof foodApi.updateOrderStatus>[1] }) =>
      foodApi.updateOrderStatus(orderId, status),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.order(vars.orderId) });
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}

export function useCreateMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof foodApi.createMenuItem>[1]) =>
      foodApi.createMenuItem(restaurantId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.menuItems(restaurantId, true) });
      void queryClient.invalidateQueries({ queryKey: foodKeys.menuItems(restaurantId, false) });
    },
  });
}

export function useDeleteMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foodApi.deleteMenuItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.menuItems(restaurantId, true) });
      void queryClient.invalidateQueries({ queryKey: foodKeys.menuItems(restaurantId, false) });
    },
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foodApi.createRestaurant,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}
