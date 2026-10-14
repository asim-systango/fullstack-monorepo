import { canMoveStatus, getNextStatuses } from './order-status';
import { OrderStatus } from './order.entity';

describe('order status machine', () => {
  it('allows the Must one-way path', () => {
    expect(canMoveStatus(OrderStatus.PLACED, OrderStatus.PREPARING)).toBe(true);
    expect(canMoveStatus(OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY)).toBe(true);
    expect(canMoveStatus(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED)).toBe(true);
    expect(canMoveStatus(OrderStatus.PLACED, OrderStatus.CANCELLED)).toBe(true);
  });

  it('rejects skipped and backward transitions', () => {
    expect(canMoveStatus(OrderStatus.PLACED, OrderStatus.DELIVERED)).toBe(false);
    expect(canMoveStatus(OrderStatus.DELIVERED, OrderStatus.PREPARING)).toBe(false);
    expect(canMoveStatus(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
    expect(canMoveStatus(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED)).toBe(false);
  });

  it('returns no next statuses from terminal delivered', () => {
    expect(getNextStatuses(OrderStatus.DELIVERED)).toEqual([]);
    expect(getNextStatuses(OrderStatus.CANCELLED)).toEqual([]);
  });
});
