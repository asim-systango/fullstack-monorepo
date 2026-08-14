const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Aug 13, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "August 13, 2026" — used on the public article header. */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * "10 minutes ago" for recent edits, falling back to an absolute date after a week
 * so older drafts stay scannable.
 */
export function formatRelativeTime(iso: string): string {
  const elapsed = Date.now() - new Date(iso).getTime();

  if (Number.isNaN(elapsed)) return '';
  if (elapsed < MINUTE) return 'just now';

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (elapsed < HOUR) {
    return formatter.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  if (elapsed < DAY) {
    return formatter.format(-Math.floor(elapsed / HOUR), 'hour');
  }
  if (elapsed < 7 * DAY) {
    return formatter.format(-Math.floor(elapsed / DAY), 'day');
  }

  return formatDate(iso);
}
