export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentCheckout = {
  mock?: boolean;
  keyId: string;
  amount: number;
  amountInr?: number;
  currency: string;
  orderId: string;
  razorpayOrderId: string | null;
  paymentId: string;
  provider: string;
  status: string;
  note?: string;
};

export type VerifyPaymentInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
};

export type VerifyPaymentResult = {
  orderId: string;
  paymentStatus: PaymentStatus;
  razorpayPaymentId?: string;
  message: string;
};

export type RestaurantDietType = 'veg' | 'non_veg' | 'both';

export type Restaurant = {
  id: string;
  ownerUserId: string;
  name: string;
  cuisine: string;
  address: string;
  description?: string;
  emoji?: string;
  imageUrl?: string | null;
  rating?: number;
  eta?: string;
  dietType: RestaurantDietType;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
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
  scope?: 'mine' | 'restaurant' | 'all';
};

export type PlaceOrderInput = {
  deliveryAddress: string;
};

export type CreateMenuItemInput = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export type CreateRestaurantInput = {
  name: string;
  cuisine: string;
  address: string;
  description?: string;
  ownerEmail: string;
  eta?: string;
  rating?: number;
  imageUrl?: string;
  dietType?: RestaurantDietType;
};

export type StaffLoginDetails = {
  email: string;
  password: string;
  role: 'staff';
};

export type CreateRestaurantResult = {
  restaurant: Restaurant;
  staffLogin: StaffLoginDetails | null;
};

export type UpdateRestaurantInput = {
  name?: string;
  cuisine?: string;
  address?: string;
  description?: string;
  emoji?: string;
  imageUrl?: string;
  eta?: string;
  rating?: number;
  dietType?: RestaurantDietType;
};
