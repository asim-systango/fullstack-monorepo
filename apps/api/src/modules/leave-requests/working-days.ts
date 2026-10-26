import { eachDate, isWeekend } from '../../common/dates';

// mon-fri only, holidays skipped, both dates included
export function workingDates(
  startDate: string,
  endDate: string,
  holidays: ReadonlySet<string> = new Set<string>(),
): string[] {
  return eachDate(startDate, endDate).filter(
    (date) => !isWeekend(date) && !holidays.has(date),
  );
}

export function countWorkingDays(
  startDate: string,
  endDate: string,
  holidays: ReadonlySet<string> = new Set<string>(),
): number {
  return workingDates(startDate, endDate, holidays).length;
}
