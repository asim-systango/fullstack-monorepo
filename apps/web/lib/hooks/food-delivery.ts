'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth';
import { foodApi } from '@/lib/food-api';
import { foodKeys } from '@/lib/query-keys';
import { useAppSelector } from '@/lib/store';

type UseCartOptions = {
  /** Set false to skip the API call (e.g. sidebar should not fetch cart). */
  enabled?: boolean;
};

export function useRestaurants(page = 1, enabled = true) {
  const cuisine = useAppSelector((s) => s.filters.restaurantCuisineApplied);
  const q = useAppSelector((s) => s.filters.restaurantSearchApplied);

  return useQuery({
    queryKey: foodKeys.restaurants({ cuisine, q, page }),
    queryFn: () => foodApi.listRestaurants({ cuisine: cuisine || undefined, q: q || undefined, page }),
    enabled,
  });
}

/** Staff kitchen: the one restaurant owned by the logged-in user. */
export function useMyRestaurant(enabled = true) {
  const { user, loading } = useAuth();
  const canLoad =
    !loading &&
    Boolean(user?.id) &&
    (user?.role === 'staff' || user?.role === 'admin') &&
    enabled;

  return useQuery({
    queryKey: foodKeys.myRestaurant(user?.id ?? 'guest'),
    queryFn: () => foodApi.getMyRestaurant(),
    enabled: canLoad,
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

/** Fetch cart only for the logged-in customer and only when enabled. */
export function useCart(options: UseCartOptions = {}) {
  const { user, loading } = useAuth();
  const canLoadCart =
    !loading && Boolean(user?.id) && (user?.role === 'user' || user?.role === 'admin');
  const enabled = options.enabled !== false && canLoadCart;

  return useQuery({
    queryKey: foodKeys.cart(user?.id ?? 'guest'),
    queryFn: () => foodApi.getCart(),
    enabled,
  });
}

export function useAddToCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, quantity }: { menuItemId: string; quantity?: number }) =>
      foodApi.addToCart(menuItemId, quantity),
    onSuccess: () => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: foodKeys.cart(user.id) });
      }
    },
  });
}

export function useUpdateCartItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      foodApi.updateCartItem(cartItemId, quantity),
    onSuccess: () => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: foodKeys.cart(user.id) });
      }
    },
  });
}

export function useClearCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => foodApi.clearCart(),
    onSuccess: () => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: foodKeys.cart(user.id) });
      }
    },
  });
}

export function usePlaceOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foodApi.placeOrder,
    onSuccess: () => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: foodKeys.cart(user.id) });
      }
    },
  });
}

export function useOrders(
  scope: 'mine' | 'restaurant' | 'all' = 'mine',
  page = 1,
  enabled = true,
) {
  const { user, loading } = useAuth();
  const status = useAppSelector((s) => s.filters.orderStatusApplied);
  const canLoad = !loading && Boolean(user?.id) && enabled;

  return useQuery({
    queryKey: foodKeys.orders(user?.id ?? 'guest', scope, { status, page }),
    queryFn: () =>
      foodApi.listOrders({ status: status || undefined, page, scope }),
    enabled: canLoad,
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Parameters<typeof foodApi.updateOrderStatus>[1] }) =>
      foodApi.updateOrderStatus(orderId, status),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.order(vars.orderId) });
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: foodKeys.orders(user.id, 'mine') });
        void queryClient.invalidateQueries({ queryKey: foodKeys.orders(user.id, 'restaurant') });
        void queryClient.invalidateQueries({ queryKey: ['food', 'orders'] });
      }
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

export function useUpdateMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof foodApi.updateMenuItem>[1];
    }) => foodApi.updateMenuItem(id, input),
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
      void queryClient.invalidateQueries({ queryKey: foodKeys.restaurants() });
      void queryClient.invalidateQueries({ queryKey: [...foodKeys.all, 'restaurant', 'mine'] });
    },
  });
}

export function useCreatePaymentCheckout() {
  return useMutation({
    mutationFn: (orderId: string) => foodApi.createPaymentCheckout(orderId),
  });
}

export function useVerifyPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: Parameters<typeof foodApi.verifyPayment>[1];
    }) => foodApi.verifyPayment(orderId, input),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.order(vars.orderId) });
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: foodKeys.orders(user.id, 'mine') });
        void queryClient.invalidateQueries({ queryKey: foodKeys.orders(user.id, 'restaurant') });
        void queryClient.invalidateQueries({ queryKey: ['food', 'orders'] });
      }
    },
  });
}
