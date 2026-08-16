export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(baseIso: string, days: number): string {
  const d = new Date(`${baseIso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Calendar days late (ceil); 0 if on/before due date. */
export function calendarDaysOverdue(dueDate: string, asOf: Date): number {
  const due = new Date(`${dueDate}T00:00:00.000Z`);
  const asOfDay = new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()),
  );
  const ms = asOfDay.getTime() - due.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}
