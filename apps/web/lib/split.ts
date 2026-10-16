/** Split `totalCents` across `count` people using largest remainder. */
export function splitEqually(totalCents: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function shareSum(shares: { amountCents: number }[]): number {
  return shares.reduce((acc, s) => acc + s.amountCents, 0);
}

export function parseMoneyToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}
