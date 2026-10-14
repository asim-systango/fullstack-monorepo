import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: Readonly<SkeletonProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-border/80', className)}
      {...props}
    />
  );
}
