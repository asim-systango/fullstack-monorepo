export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid';

export type Restaurant = {
  id: string;
  ownerUserId: string;
  name: string;
  cuisine: string;
  address: string;
  description?: string;
  emoji?: string;
  rating?: number;
  eta?: string;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  deletedAt?: string | null;
};

export type CartLine = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export type CartSummary = {
  items: CartLine[];
  restaurantId: string | null;
  restaurantName: string | null;
};

export type OrderPricing = {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxAmount: number;
  total: number;
  currency: 'INR';
};

export type OrderLine = {
  id: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export type DeliveryStatusEntry = {
  id: string;
  status: OrderStatus;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  status: OrderStatus;
  deliveryAddress: string;
  paymentStatus: PaymentStatus;
  estimatedMinutes?: number | null;
  lines: OrderLine[];
  deliveryStatuses: DeliveryStatusEntry[];
  createdAt: string;
} & OrderPricing;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type RestaurantFilters = {
  cuisine?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type OrderFilters = {
  status?: OrderStatus | '';
  page?: number;
  limit?: number;
};

export type PlaceOrderInput = {
  deliveryAddress: string;
};

export type CreateMenuItemInput = {
  name: string;
  description?: string;
  price: number;
};

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export type CreateRestaurantInput = {
  name: string;
  cuisine: string;
  address: string;
  description?: string;
  ownerUserId: string;
};
