import {
  endOfYear,
  formatDate,
  formatDay,
  formatRange,
  isWeekend,
  isYmd,
  todayLocal,
  weekdayShort,
  workingDaysLabel,
} from './dates';

describe('web date helpers', () => {
  it('validates YYYY-MM-DD dates', () => {
    expect(isYmd('2026-10-16')).toBe(true);
    expect(isYmd('2024-02-29')).toBe(true);
    expect(isYmd('2026-02-30')).toBe(false);
    expect(isYmd('2026-1-5')).toBe(false);
    expect(isYmd('')).toBe(false);
  });

  it('uses the local calendar day for today', () => {
    expect(todayLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('formats without shifting the day', () => {
    expect(weekdayShort('2026-10-16')).toBe('Fri');
    expect(formatDay('2026-10-16')).toBe('Fri 16 Oct');
    expect(formatDate('2026-10-16')).toBe('16 Oct 2026');
    expect(endOfYear('2026-10-16')).toBe('2026-12-31');
  });

  it('spots weekends', () => {
    expect(isWeekend('2026-10-17')).toBe(true);
    expect(isWeekend('2026-10-18')).toBe(true);
    expect(isWeekend('2026-10-16')).toBe(false);
  });

  it('formats ranges', () => {
    expect(formatRange('2026-10-16', '2026-10-16')).toBe('Fri 16 Oct');
    expect(formatRange('2026-10-16', '2026-10-20')).toBe('Fri 16 Oct → Tue 20 Oct');
  });

  it('builds the working days label from the brief', () => {
    expect(workingDaysLabel(3, '2026-10-16', '2026-10-20')).toBe(
      '3 working days, Fri to Tue',
    );
    expect(workingDaysLabel(1, '2026-10-16', '2026-10-16')).toBe('1 working day, Fri');
  });
});
