import { QueryFailedError } from 'typeorm';
import { isUniqueViolation } from './db-errors';

function driverError(code: string) {
  return Object.assign(new Error('db'), { code });
}

describe('isUniqueViolation', () => {
  it('detects Postgres unique violations', () => {
    const err = new QueryFailedError('INSERT', [], driverError('23505'));
    expect(isUniqueViolation(err)).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isUniqueViolation(new Error('nope'))).toBe(false);
    expect(isUniqueViolation(new QueryFailedError('INSERT', [], driverError('23503')))).toBe(
      false,
    );
  });
});
