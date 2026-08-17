import { daysLate } from './days-late';

describe('daysLate', () => {
  const asOf = new Date('2026-08-10T12:00:00.000Z');

  it('is 0 when due today or later', () => {
    expect(daysLate('2026-08-10', asOf)).toBe(0);
    expect(daysLate('2026-08-12', asOf)).toBe(0);
  });

  it('counts whole UTC calendar days', () => {
    expect(daysLate('2026-08-07', asOf)).toBe(3);
    expect(daysLate(new Date('2026-08-07T00:00:00.000Z'), asOf)).toBe(3);
  });
});
