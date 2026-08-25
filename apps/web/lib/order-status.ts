import type { OrderStatus } from '@/lib/types/food-delivery';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  placed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
};

export const NEXT_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  preparing: 'Start preparing',
  out_for_delivery: 'Mark out for delivery',
  delivered: 'Mark delivered',
  cancelled: 'Cancel order',
};

export function getNextStatuses(status: OrderStatus): OrderStatus[] {
  return NEXT_STATUS[status] ?? [];
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}
