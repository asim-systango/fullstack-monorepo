import type { ValueTransformer } from 'typeorm';

export const decimalToNumber: ValueTransformer = {
  to(value: number): number {
    return value;
  },
  from(value: string): number {
    return Number(value);
  },
};
