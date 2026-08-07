import type { ValueTransformer } from 'typeorm';

// PostgreSQL returns numeric columns as strings. This converts them back to numbers.
export const decimalToNumber: ValueTransformer = {
  to(value: number): number {
    return value;
  },
  from(value: string): number {
    return Number(value);
  },
};
