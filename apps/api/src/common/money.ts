/** Format a numeric money value as a numeric(10,2) string. */
export function toMoneyString(value: number): string {
  return value.toFixed(2);
}

/** Convert money to integer cents to avoid float drift on numeric(10,2). */
export function toCents(value: string | number): number {
  const normalized =
    typeof value === 'number' ? value.toFixed(2) : Number(value).toFixed(2);
  return Math.round(Number(normalized) * 100);
}

export function centsToMoneyString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Max value that fits Postgres numeric(10,2). */
export const MONEY_MAX = 99_999_999.99;
