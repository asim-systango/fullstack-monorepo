import { OrderStatus } from './order.entity';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PLACED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
};

export function getNextStatuses(status: OrderStatus): OrderStatus[] {
  return NEXT_STATUS[status] ?? [];
}

export function canMoveStatus(from: OrderStatus, to: OrderStatus): boolean {
  return getNextStatuses(from).includes(to);
}
