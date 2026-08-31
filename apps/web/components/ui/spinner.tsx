import type { OutputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-8 border-[3px]',
} as const;

export type SpinnerSize = keyof typeof sizeClasses;

export type SpinnerProps = OutputHTMLAttributes<HTMLOutputElement> & {
  size?: SpinnerSize;
  label?: string;
};

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...props
}: Readonly<SpinnerProps>) {
  return (
    <output
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-current border-r-transparent',
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </output>
  );
}
