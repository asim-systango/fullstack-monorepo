/** Format integer cents as currency string. */
export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Signed balance label — positive means owed to you. */
export function formatBalance(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'settled up';
  const abs = formatMoney(Math.abs(cents), currency);
  return cents > 0 ? `you are owed ${abs}` : `you owe ${abs}`;
}
