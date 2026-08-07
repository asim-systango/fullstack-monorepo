import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';
import type {
  CartSummary,
  CreateMenuItemInput,
  CreateRestaurantInput,
  MenuItem,
  Order,
  OrderFilters,
  OrderStatus,
  Paginated,
  PlaceOrderInput,
  Restaurant,
  RestaurantFilters,
  UpdateMenuItemInput,
} from '@/lib/types/food-delivery';

/** Real API calls — same shapes the Nest backend will expose. */
export const foodApiClient = {
  listRestaurants(filters: RestaurantFilters = {}) {
    return apiClient
      .get('/restaurants', { params: filters })
      .then((res) => unwrapData<Paginated<Restaurant>>(res.data));
  },

  getRestaurant(id: string) {
    return apiClient.get(`/restaurants/${id}`).then((res) => unwrapData<Restaurant>(res.data));
  },

  createRestaurant(input: CreateRestaurantInput) {
    return apiClient.post('/restaurants', input).then((res) => unwrapData<Restaurant>(res.data));
  },

  listMenuItems(restaurantId: string, includeDeleted = false) {
    return apiClient
      .get('/menu-items', { params: { restaurantId, includeDeleted } })
      .then((res) => unwrapData<MenuItem[]>(res.data));
  },

  getMenuItem(id: string) {
    return apiClient.get(`/menu-items/${id}`).then((res) => unwrapData<MenuItem>(res.data));
  },

  createMenuItem(restaurantId: string, input: CreateMenuItemInput) {
    return apiClient
      .post('/menu-items', { ...input, restaurantId })
      .then((res) => unwrapData<MenuItem>(res.data));
  },

  updateMenuItem(id: string, input: UpdateMenuItemInput) {
    return apiClient.patch(`/menu-items/${id}`, input).then((res) => unwrapData<MenuItem>(res.data));
  },

  deleteMenuItem(id: string) {
    return apiClient.delete(`/menu-items/${id}`).then(() => undefined);
  },

  getCart() {
    return apiClient.get('/cart').then((res) => unwrapData<CartSummary>(res.data));
  },

  addToCart(menuItemId: string, quantity = 1) {
    return apiClient
      .post('/cart/items', { menuItemId, quantity })
      .then((res) => unwrapData<CartSummary>(res.data));
  },

  updateCartItem(cartItemId: string, quantity: number) {
    return apiClient
      .patch(`/cart/items/${cartItemId}`, { quantity })
      .then((res) => unwrapData<CartSummary>(res.data));
  },

  clearCart() {
    return apiClient.delete('/cart').then((res) => unwrapData<CartSummary>(res.data));
  },

  listOrders(filters: OrderFilters = {}) {
    return apiClient
      .get('/orders', { params: filters })
      .then((res) => unwrapData<Paginated<Order>>(res.data));
  },

  getOrder(id: string) {
    return apiClient.get(`/orders/${id}`).then((res) => unwrapData<Order>(res.data));
  },

  placeOrder(input: PlaceOrderInput) {
    return apiClient.post('/orders', input).then((res) => unwrapData<Order>(res.data));
  },

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return apiClient
      .patch(`/orders/${orderId}/status`, { status })
      .then((res) => unwrapData<Order>(res.data));
  },
};

export function isMockFoodApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}
