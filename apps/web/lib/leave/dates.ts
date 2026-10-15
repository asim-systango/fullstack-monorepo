// dates travel as 'YYYY-MM-DD' strings, we format them in UTC so the day never shifts in IST
const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const weekdayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  timeZone: 'UTC',
});
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const fullFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parseYmd(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function isYmd(value: string): boolean {
  if (!YMD_PATTERN.exec(value)) return false;
  const date = parseYmd(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// the user's own calendar day (local time on purpose)
export function todayLocal(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function endOfYear(value: string): string {
  return `${value.slice(0, 4)}-12-31`;
}

export function weekdayShort(value: string): string {
  return weekdayFormat.format(parseYmd(value));
}

// "Fri 16 Oct"
export function formatDay(value: string): string {
  return dayFormat.format(parseYmd(value));
}

// "16 Oct 2026"
export function formatDate(value: string): string {
  return fullFormat.format(parseYmd(value));
}

export function formatRange(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDay(startDate);
  return `${formatDay(startDate)} → ${formatDay(endDate)}`;
}

// "3 working days, Fri to Tue" like in the brief
export function workingDaysLabel(
  days: number,
  startDate: string,
  endDate: string,
): string {
  const unit = days === 1 ? 'working day' : 'working days';
  if (startDate === endDate) return `${days} ${unit}, ${weekdayShort(startDate)}`;
  return `${days} ${unit}, ${weekdayShort(startDate)} to ${weekdayShort(endDate)}`;
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}
