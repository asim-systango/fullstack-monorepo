import { z } from 'zod';

const DURATION_PATTERN = /^(\d+)([smhd])?$/;

/** Parse `15m`, `1h`, `7d`, or bare seconds into milliseconds. */
export function parseDurationToMs(
  value: string,
  fallbackMs = 7 * 24 * 60 * 60 * 1000,
): number {
  const trimmed = value.trim();
  const match = DURATION_PATTERN.exec(trimmed);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (multipliers[unit] ?? 1000);
}

export function durationStringSchema(defaultValue: string) {
  return z
    .string()
    .regex(
      DURATION_PATTERN,
      "must be digits with an optional s/m/h/d suffix (e.g. '30m', '1d')",
    )
    .default(defaultValue);
}
