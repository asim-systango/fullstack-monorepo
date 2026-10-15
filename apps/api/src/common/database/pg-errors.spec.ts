import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { pgErrorCode, rethrowDbError } from './pg-errors';

function pgError(code: string) {
  return new QueryFailedError('INSERT ...', [], Object.assign(new Error('db'), { code }));
}

describe('pg errors', () => {
  it('reads the postgres error code', () => {
    expect(pgErrorCode(pgError('23505'))).toBe('23505');
    expect(pgErrorCode(new Error('not a db error'))).toBeUndefined();
  });

  it('turns unique and exclusion violations into 409', () => {
    expect(() => rethrowDbError(pgError('23505'))).toThrow(ConflictException);
    expect(() => rethrowDbError(pgError('23P01'), { conflict: 'Dates overlap' })).toThrow(
      'Dates overlap',
    );
  });

  it('turns check violations into 400', () => {
    expect(() => rethrowDbError(pgError('23514'))).toThrow(BadRequestException);
  });

  it('rethrows anything else unchanged', () => {
    const notFound = new NotFoundException('gone');
    expect(() => rethrowDbError(notFound)).toThrow(notFound);
  });
});
