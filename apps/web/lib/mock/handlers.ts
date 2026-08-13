import { ApiClientError } from '@shared/api-client';
import { calculatePricing } from '@/lib/pricing';
import { getNextStatuses } from '@/lib/order-status';
import type {
  CartSummary,
  CreateMenuItemInput,
  CreateRestaurantInput,
  CreateRestaurantResult,
  MenuItem,
  Order,
  OrderFilters,
  OrderStatus,
  Paginated,
  PlaceOrderInput,
  Restaurant,
  RestaurantFilters,
  UpdateMenuItemInput,
  UpdateRestaurantInput,
  PaymentCheckout,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from '@/lib/types/food-delivery';
import { createMockStore, type MockStore } from './data';
import { saveMockDeliveryAddress } from './auth';
import { staffPasswordFromRestaurantName } from '@/lib/staff-password';

let store: MockStore = createMockStore();

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uuid(): string {
  return crypto.randomUUID();
}

function restaurantName(id: string): string {
  return store.restaurants.find((r) => r.id === id)?.name ?? 'Restaurant';
}

function paginate<T>(items: T[], page = 1, limit = 12): Paginated<T> {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}

/** Each logged-in user has their own cart in mock mode. */
function userCart() {
  const userId = store.currentUserId;
  if (!store.cartsByUser[userId]) {
    store.cartsByUser[userId] = [];
  }
  return store.cartsByUser[userId];
}

export const mockFoodApi = {
  async listRestaurants(filters: RestaurantFilters = {}): Promise<Paginated<Restaurant>> {
    await delay();
    let items = [...store.restaurants];
    if (filters.cuisine) {
      items = items.filter((r) =>
        r.cuisine.toLowerCase().includes(filters.cuisine!.toLowerCase()),
      );
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q),
      );
    }
    return paginate(items, filters.page, filters.limit);
  },

  async getMyRestaurant(): Promise<Restaurant | null> {
    await delay();
    const userId = store.currentUserId;
    return store.restaurants.find((r) => r.ownerUserId === userId) ?? null;
  },

  async getRestaurant(id: string): Promise<Restaurant> {
    await delay();
    const item = store.restaurants.find((r) => r.id === id);
    if (!item) throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Restaurant not found' });
    return item;
  },

  async createRestaurant(input: CreateRestaurantInput): Promise<CreateRestaurantResult> {
    await delay();
    const ownerUserId = crypto.randomUUID();
    const created: Restaurant = {
      id: uuid(),
      ownerUserId,
      name: input.name,
      cuisine: input.cuisine,
      address: input.address,
      description: input.description,
      imageUrl: input.imageUrl,
      eta: input.eta,
      rating: input.rating ?? 0,
    };
    store.restaurants.push(created);
    return {
      restaurant: created,
      staffLogin: {
        email: input.ownerEmail.trim().toLowerCase(),
        password: staffPasswordFromRestaurantName(input.name),
        role: 'staff',
      },
    };
  },

  async updateRestaurant(id: string, input: UpdateRestaurantInput): Promise<Restaurant> {
    await delay();
    const index = store.restaurants.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Restaurant not found' });
    }
    const existing = store.restaurants[index];
    if (!existing) {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Restaurant not found' });
    }
    const updated: Restaurant = { ...existing, ...input };
    store.restaurants[index] = updated;
    return updated;
  },

  async listMenuItems(restaurantId: string, includeDeleted = false): Promise<MenuItem[]> {
    await delay();
    return store.menuItems.filter(
      (m) => m.restaurantId === restaurantId && (includeDeleted || !m.deletedAt),
    );
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    await delay();
    const item = store.menuItems.find((m) => m.id === id);
    if (!item) throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Menu item not available' });
    return item;
  },

  async createMenuItem(restaurantId: string, input: CreateMenuItemInput): Promise<MenuItem> {
    await delay();
    const created: MenuItem = { id: uuid(), restaurantId, ...input };
    store.menuItems.push(created);
    return created;
  },

  async updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    await delay();
    const index = store.menuItems.findIndex((m) => m.id === id);
    if (index === -1) throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Menu item not found' });
    const existing = store.menuItems[index];
    if (!existing) {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Menu item not found' });
    }
    const updated: MenuItem = { ...existing, ...input };
    store.menuItems[index] = updated;
    return updated;
  },

  async deleteMenuItem(id: string): Promise<void> {
    await delay();
    const item = store.menuItems.find((m) => m.id === id);
    if (!item) throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Menu item not found' });
    item.deletedAt = new Date().toISOString();
  },

  async getCart(): Promise<CartSummary> {
    await delay();
    const cart = userCart();
    const first = cart[0];
    return {
      items: [...cart],
      restaurantId: first?.restaurantId ?? null,
      restaurantName: first?.restaurantName ?? null,
    };
  },

  async addToCart(menuItemId: string, quantity = 1): Promise<CartSummary> {
    await delay();
    const menuItem = store.menuItems.find((m) => m.id === menuItemId && !m.deletedAt);
    if (!menuItem) {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Menu item not available' });
    }

    const cart = userCart();
    const cartRestaurantId = cart[0]?.restaurantId;
    if (cartRestaurantId && cartRestaurantId !== menuItem.restaurantId) {
      throw new ApiClientError({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Cart already has items from another restaurant',
      });
    }

    const existing = cart.find((c) => c.menuItemId === menuItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: uuid(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        restaurantId: menuItem.restaurantId,
        restaurantName: restaurantName(menuItem.restaurantId),
      });
    }
    return mockFoodApi.getCart();
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<CartSummary> {
    await delay();
    const cart = userCart();
    const item = cart.find((c) => c.id === cartItemId);
    if (!item) throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Cart item not found' });
    if (quantity <= 0) {
      store.cartsByUser[store.currentUserId] = cart.filter((c) => c.id !== cartItemId);
    } else {
      item.quantity = quantity;
    }
    return mockFoodApi.getCart();
  },

  async clearCart(): Promise<CartSummary> {
    await delay();
    store.cartsByUser[store.currentUserId] = [];
    return mockFoodApi.getCart();
  },

  async listOrders(filters: OrderFilters = {}): Promise<Paginated<Order>> {
    await delay();
    const scope = filters.scope ?? 'mine';
    let items = store.orders.filter((o) => o.paymentStatus === 'paid');

    if (scope === 'mine') {
      items = items.filter((o) => o.userId === store.currentUserId);
    } else if (scope === 'restaurant') {
      const mine = store.restaurants.find((r) => r.ownerUserId === store.currentUserId);
      items = mine ? items.filter((o) => o.restaurantId === mine.id) : [];
    }
    // scope === 'all' → no extra filter

    if (filters.status) items = items.filter((o) => o.status === filters.status);
    return paginate(items, filters.page, filters.limit);
  },

  async getOrder(id: string): Promise<Order> {
    await delay();
    const order = store.orders.find((o) => o.id === id);
    if (!order || order.paymentStatus !== 'paid') {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Order not found' });
    }
    return order;
  },

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    await delay();
    const cart = userCart();
    if (cart.length === 0) {
      throw new ApiClientError({ statusCode: 400, error: 'Bad Request', message: 'Cart is empty' });
    }

    const firstLine = cart[0];
    if (!firstLine) {
      throw new ApiClientError({ statusCode: 400, error: 'Bad Request', message: 'Cart is empty' });
    }

    const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const pricing = calculatePricing(subtotal);
    const restaurantId = firstLine.restaurantId;
    const now = new Date().toISOString();

    const order: Order = {
      id: uuid(),
      userId: store.currentUserId,
      restaurantId,
      restaurantName: restaurantName(restaurantId),
      status: 'placed',
      deliveryAddress: input.deliveryAddress,
      paymentStatus: 'pending',
      ...pricing,
      createdAt: now,
      lines: cart.map((line) => ({
        id: uuid(),
        menuItemId: line.menuItemId,
        itemName: line.name,
        quantity: line.quantity,
        unitPrice: line.price,
      })),
      deliveryStatuses: [{ id: uuid(), status: 'placed', createdAt: now }],
    };

    store.orders.unshift(order);
    store.cartsByUser[store.currentUserId] = [];
    saveMockDeliveryAddress(store.currentUserId, input.deliveryAddress);
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    await delay();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Order not found' });

    const allowed = getNextStatuses(order.status);
    if (!allowed.includes(status)) {
      throw new ApiClientError({
        statusCode: 400,
        error: 'Bad Request',
        message: `Cannot move from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    order.deliveryStatuses.push({ id: uuid(), status, createdAt: new Date().toISOString() });
    if (status === 'preparing' && !order.estimatedMinutes) order.estimatedMinutes = 30;
    return order;
  },

  async createPaymentCheckout(orderId: string): Promise<PaymentCheckout> {
    await delay();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Order not found' });
    }
    const razorpayOrderId = `order_mock_${order.id.replace(/-/g, '').slice(0, 14)}`;
    return {
      mock: true,
      keyId: 'rzp_test_mock_key',
      amount: Math.round(order.total * 100),
      currency: 'INR',
      orderId: order.id,
      razorpayOrderId,
      paymentId: uuid(),
      provider: 'razorpay',
      status: 'created',
      note: 'Mock Razorpay checkout',
    };
  },

  async verifyPayment(orderId: string, input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    await delay();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new ApiClientError({ statusCode: 404, error: 'Not Found', message: 'Order not found' });
    }
    order.paymentStatus = 'paid';
    return {
      orderId: order.id,
      paymentStatus: 'paid',
      razorpayPaymentId: input.razorpayPaymentId,
      message: 'Payment captured (mock Razorpay)',
    };
  },

  /** Swap mock user for demo login simulation. */
  setCurrentUser(userId: string) {
    store.currentUserId = userId;
  },

  reset() {
    store = createMockStore();
  },
};
