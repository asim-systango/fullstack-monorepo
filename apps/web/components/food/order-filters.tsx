'use client';

import { Button, Field, Select } from '@shared/ui/components';
import { ORDER_STATUS_LABELS } from '@/lib/order-status';
import type { OrderStatus } from '@/lib/types/food-delivery';
import {
  applyOrderStatusFilter,
  clearOrderStatusFilter,
  setOrderStatusDraft,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

const STATUS_OPTIONS: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  ...(['placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(
    (s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }),
  ),
];

export function OrderFiltersBar() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.filters.orderStatusDraft);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(applyOrderStatusFilter());
      }}
    >
      <Field label="Status" htmlFor="filter-order-status" className="sm:min-w-48">
        <Select
          id="filter-order-status"
          value={status}
          onChange={(e) => dispatch(setOrderStatusDraft(e.target.value as OrderStatus | ''))}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit">Apply</Button>
      <Button type="button" variant="ghost" onClick={() => dispatch(clearOrderStatusFilter())}>
        Clear
      </Button>
    </form>
  );
}
