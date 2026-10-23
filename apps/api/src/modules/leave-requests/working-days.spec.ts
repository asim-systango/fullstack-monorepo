import { countWorkingDays, workingDates } from './working-days';

describe('countWorkingDays', () => {
  it('counts Fri → Tue as 3 days (the weekend is skipped)', () => {
    expect(countWorkingDays('2026-10-16', '2026-10-20')).toBe(3);
  });

  it('counts a single weekday as 1', () => {
    expect(countWorkingDays('2026-10-14', '2026-10-14')).toBe(1);
  });

  it('returns 0 for a weekend-only range', () => {
    expect(countWorkingDays('2026-10-17', '2026-10-18')).toBe(0);
  });

  it('returns 0 when the end is before the start', () => {
    expect(countWorkingDays('2026-10-20', '2026-10-16')).toBe(0);
  });

  it('counts a full Mon–Fri week as 5', () => {
    expect(countWorkingDays('2026-10-12', '2026-10-16')).toBe(5);
  });

  it('skips public holidays', () => {
    const holidays = new Set(['2026-10-02']); // Gandhi Jayanti (Friday)
    expect(countWorkingDays('2026-09-28', '2026-10-02', holidays)).toBe(4);
  });

  it('lists the dates actually taken', () => {
    expect(workingDates('2026-10-16', '2026-10-20')).toEqual([
      '2026-10-16',
      '2026-10-19',
      '2026-10-20',
    ]);
  });
});
