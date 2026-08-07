import type { OrderPricing } from '@/lib/types/food-delivery';

const DELIVERY_FEE_FLAT = 40;
const PLATFORM_FEE_PERCENT = 5;
const TAX_PERCENT = 5;
const FREE_DELIVERY_MIN = 500;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Same formula as backend PRD — keep in sync when API is wired. */
export function calculatePricing(subtotal: number): OrderPricing {
  const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE_FLAT;
  const platformFee = round2(subtotal * (PLATFORM_FEE_PERCENT / 100));
  const taxableBase = subtotal + deliveryFee + platformFee;
  const taxAmount = round2(taxableBase * (TAX_PERCENT / 100));
  const total = round2(subtotal + deliveryFee + platformFee + taxAmount);

  return {
    subtotal: round2(subtotal),
    deliveryFee: round2(deliveryFee),
    platformFee,
    taxAmount,
    total,
    currency: 'INR',
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
