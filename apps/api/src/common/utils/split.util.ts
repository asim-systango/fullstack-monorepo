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
