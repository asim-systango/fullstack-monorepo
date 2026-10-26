import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export const PG_UNIQUE_VIOLATION = '23505';
export const PG_EXCLUSION_VIOLATION = '23P01';
export const PG_CHECK_VIOLATION = '23514';

export function pgErrorCode(err: unknown): string | undefined {
  if (!(err instanceof QueryFailedError)) return undefined;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code;
}

type DbErrorMessages = { conflict?: string; check?: string };

// the db constraints are our backup check, turn their errors into a proper 409 / 400
export function rethrowDbError(err: unknown, messages: DbErrorMessages = {}): never {
  const code = pgErrorCode(err);
  if (code === PG_UNIQUE_VIOLATION || code === PG_EXCLUSION_VIOLATION) {
    throw new ConflictException(messages.conflict ?? 'This clashes with existing data');
  }
  if (code === PG_CHECK_VIOLATION) {
    throw new BadRequestException(messages.check ?? 'This breaks a data rule');
  }
  throw err;
}
