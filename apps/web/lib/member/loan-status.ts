export type LoanDueTone = 'healthy' | 'dueSoon' | 'overdue';

const DUE_SOON_DAYS = 3;

function utcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function calendarDaysUntilDue(dueDate: string, now = new Date()): number {
  const due = new Date(`${dueDate.slice(0, 10)}T00:00:00Z`);
  return Math.floor((due.getTime() - utcDayMs(now)) / 86_400_000);
}

function dueSoonLabel(days: number): string {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due in 1 day';
  return `Due in ${days} days`;
}

function overdueLabel(daysLate: number): string {
  if (daysLate === 1) return '1 day overdue';
  return `${daysLate} days overdue`;
}

export function getLoanDueStatus(
  dueDate: string,
  overdueFlag?: boolean,
): { tone: LoanDueTone; days: number; label: string } {
  const days = calendarDaysUntilDue(dueDate);
  const overdue = overdueFlag === true || days < 0;

  if (overdue) {
    const late = Math.abs(Math.min(days, 0));
    return {
      tone: 'overdue',
      days: late,
      label: overdueLabel(late),
    };
  }

  if (days <= DUE_SOON_DAYS) {
    return {
      tone: 'dueSoon',
      days,
      label: dueSoonLabel(days),
    };
  }

  return {
    tone: 'healthy',
    days,
    label: `Due in ${days} days`,
  };
}

export function countDueSoon(
  loans: ReadonlyArray<{ dueDate: string; overdue?: boolean }>,
): number {
  return loans.filter((loan) => {
    const { tone } = getLoanDueStatus(loan.dueDate, loan.overdue);
    return tone === 'dueSoon';
  }).length;
}
