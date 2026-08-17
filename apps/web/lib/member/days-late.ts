/** Calendar days late (UTC date only). 0 if on or before the due date. */
export function daysLate(dueDate: string | Date, asOf: Date = new Date()): number {
  const iso =
    dueDate instanceof Date
      ? dueDate.toISOString().slice(0, 10)
      : String(dueDate).slice(0, 10);
  const due = new Date(`${iso}T00:00:00.000Z`);
  const asOfDay = new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()),
  );
  const ms = asOfDay.getTime() - due.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}
