import {
  addDays,
  eachDate,
  isWeekend,
  isYmd,
  mondayOf,
  parseYmd,
  toYmd,
  todayUtc,
  yearOf,
} from './ymd';

describe('ymd date helpers', () => {
  it.each(['2026-10-16', '2024-02-29', '2026-12-31'])('accepts real date %s', (value) => {
    expect(isYmd(value)).toBe(true);
  });

  it.each([
    '2026-02-30',
    '2025-02-29',
    '2026-13-01',
    '20261016',
    '2026-10-16T00:00:00Z',
    '',
    42,
    null,
  ])('rejects %p', (value) => {
    expect(isYmd(value)).toBe(false);
  });

  it('round-trips through UTC without shifting the day', () => {
    expect(toYmd(parseYmd('2026-10-16'))).toBe('2026-10-16');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('reads the year', () => {
    expect(yearOf('2026-10-16')).toBe(2026);
  });

  it('formats today in UTC', () => {
    expect(todayUtc(new Date('2026-10-14T23:30:00Z'))).toBe('2026-10-14');
  });

  it('detects weekends', () => {
    expect(isWeekend('2026-10-17')).toBe(true); // Saturday
    expect(isWeekend('2026-10-18')).toBe(true); // Sunday
    expect(isWeekend('2026-10-16')).toBe(false); // Friday
  });

  it('finds the Monday of a week', () => {
    expect(mondayOf('2026-10-14')).toBe('2026-10-12'); // Wednesday
    expect(mondayOf('2026-10-12')).toBe('2026-10-12'); // Monday
    expect(mondayOf('2026-10-18')).toBe('2026-10-12'); // Sunday
  });

  it('lists every date in an inclusive range', () => {
    expect(eachDate('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
    expect(eachDate('2026-10-16', '2026-10-16')).toEqual(['2026-10-16']);
    expect(eachDate('2026-10-16', '2026-10-15')).toEqual([]);
  });
});
