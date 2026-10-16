export function timeOfDayGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName: string | undefined | null): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return 'there';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function memberGreeting(
  fullName: string | undefined | null,
  now = new Date(),
): string {
  return `${timeOfDayGreeting(now)}, ${firstName(fullName)}`;
}
