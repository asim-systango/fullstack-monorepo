import { Transform } from 'class-transformer';
import { ValidateBy, type ValidationOptions } from 'class-validator';
import { isYmd } from '../dates';

// IsDateString also accepts things like 20261016, so we check YYYY-MM-DD ourselves
export function IsYmdDate(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isYmdDate',
      validator: {
        validate: (value: unknown) => isYmd(value),
        defaultMessage: (args) =>
          `${args?.property ?? 'date'} must be a date like 2026-10-16`,
      },
    },
    options,
  );
}

// ?status= with nothing after it means "no filter"
// (read the raw value, implicit conversion already turned '' into 0 for numbers)
export function EmptyToUndefined(): PropertyDecorator {
  return Transform(
    ({
      value,
      obj,
      key,
    }: {
      value: unknown;
      obj: Record<string, unknown>;
      key: string;
    }) => (obj[key] === '' ? undefined : value),
  );
}

export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
