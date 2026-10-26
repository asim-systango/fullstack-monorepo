const YMD_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SUNDAY = 0;
const SATURDAY = 6;

// using UTC everywhere so the timezone (IST) can't shift a date by one day
export function parseYmd(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isYmd(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = YMD_PATTERN.exec(value);
  if (!match) return false;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  // 2026-02-30 rolls over to march, so the round trip won't match
  return toYmd(date) === value;
}

export function addDays(value: string, days: number): string {
  const date = parseYmd(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toYmd(date);
}

export function yearOf(value: string): number {
  return Number(value.slice(0, 4));
}

// India has no daylight saving, so IST is always UTC + 5:30
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// the office runs on Indian time, so "today" changes at midnight IST, not UTC
export function todayIst(now: Date = new Date()): string {
  return toYmd(new Date(now.getTime() + IST_OFFSET_MS));
}

export function isWeekend(value: string): boolean {
  const weekday = parseYmd(value).getUTCDay();
  return weekday === SUNDAY || weekday === SATURDAY;
}

export function mondayOf(value: string): string {
  const weekday = parseYmd(value).getUTCDay();
  const sinceMonday = (weekday + 6) % 7;
  return addDays(value, -sinceMonday);
}

// both start and end are included
export function eachDate(start: string, end: string): string[] {
  const dates: string[] = [];
  for (let current = start; current <= end; current = addDays(current, 1)) {
    dates.push(current);
  }
  return dates;
}
