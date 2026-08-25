import { formatInr } from '@/lib/pricing';
import type { OrderPricing } from '@/lib/types/food-delivery';

export function PriceBreakdown({
  pricing,
  totalLabel = 'Total',
}: Readonly<{ pricing: OrderPricing; totalLabel?: string }>) {
  const rows: Array<[string, number]> = [
    ['Items subtotal', pricing.subtotal],
    ['Delivery fee', pricing.deliveryFee],
    ['Platform fee (5%)', pricing.platformFee],
    ['GST (5%)', pricing.taxAmount],
  ];

  return (
    <div>
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            fontSize: 13.5,
            color: 'var(--tg-text-muted)',
          }}
        >
          <span>{label}</span>
          <span>{formatInr(value)}</span>
        </div>
      ))}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--tg-border)',
          marginTop: 8,
          paddingTop: 10,
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text)' }}>{totalLabel}</span>
        <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text)' }}>
          {formatInr(pricing.total)}
        </span>
      </div>
    </div>
  );
}
