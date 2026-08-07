import type { User } from '@shared/api-client';
import { mockFoodApi } from '@/lib/mock/handlers';
import { foodApiClient, isMockFoodApiEnabled } from '@/lib/api/food-delivery';
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

type UserRole = User['role'];

function roleForApi(role?: UserRole): 'user' | 'staff' | 'admin' {
  if (role === 'admin') return 'admin';
  if (role === 'staff') return 'staff';
  return 'user';
}

/** Single entry point — switches mock vs real API via NEXT_PUBLIC_USE_MOCK. */
export const foodApi = {
  listRestaurants(filters?: RestaurantFilters): Promise<Paginated<Restaurant>> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.listRestaurants(filters)
      : foodApiClient.listRestaurants(filters);
  },

  getRestaurant(id: string): Promise<Restaurant> {
    return isMockFoodApiEnabled() ? mockFoodApi.getRestaurant(id) : foodApiClient.getRestaurant(id);
  },

  createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.createRestaurant(input)
      : foodApiClient.createRestaurant(input);
  },

  listMenuItems(restaurantId: string, includeDeleted = false): Promise<MenuItem[]> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.listMenuItems(restaurantId, includeDeleted)
      : foodApiClient.listMenuItems(restaurantId, includeDeleted);
  },

  getMenuItem(id: string): Promise<MenuItem> {
    return isMockFoodApiEnabled() ? mockFoodApi.getMenuItem(id) : foodApiClient.getMenuItem(id);
  },

  createMenuItem(restaurantId: string, input: CreateMenuItemInput): Promise<MenuItem> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.createMenuItem(restaurantId, input)
      : foodApiClient.createMenuItem(restaurantId, input);
  },

  updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.updateMenuItem(id, input)
      : foodApiClient.updateMenuItem(id, input);
  },

  deleteMenuItem(id: string): Promise<void> {
    return isMockFoodApiEnabled() ? mockFoodApi.deleteMenuItem(id) : foodApiClient.deleteMenuItem(id);
  },

  getCart(): Promise<CartSummary> {
    return isMockFoodApiEnabled() ? mockFoodApi.getCart() : foodApiClient.getCart();
  },

  addToCart(menuItemId: string, quantity = 1): Promise<CartSummary> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.addToCart(menuItemId, quantity)
      : foodApiClient.addToCart(menuItemId, quantity);
  },

  updateCartItem(cartItemId: string, quantity: number): Promise<CartSummary> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.updateCartItem(cartItemId, quantity)
      : foodApiClient.updateCartItem(cartItemId, quantity);
  },

  clearCart(): Promise<CartSummary> {
    return isMockFoodApiEnabled() ? mockFoodApi.clearCart() : foodApiClient.clearCart();
  },

  listOrders(filters?: OrderFilters, role?: UserRole): Promise<Paginated<Order>> {
    const apiRole = roleForApi(role);
    return isMockFoodApiEnabled()
      ? mockFoodApi.listOrders(filters, apiRole)
      : foodApiClient.listOrders(filters);
  },

  getOrder(id: string): Promise<Order> {
    return isMockFoodApiEnabled() ? mockFoodApi.getOrder(id) : foodApiClient.getOrder(id);
  },

  placeOrder(input: PlaceOrderInput): Promise<Order> {
    return isMockFoodApiEnabled() ? mockFoodApi.placeOrder(input) : foodApiClient.placeOrder(input);
  },

  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return isMockFoodApiEnabled()
      ? mockFoodApi.updateOrderStatus(orderId, status)
      : foodApiClient.updateOrderStatus(orderId, status);
  },
};

export { isMockFoodApiEnabled };
