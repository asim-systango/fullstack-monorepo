import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: Readonly<CardProps>) {
  return (
    <div className={cn('rounded-lg bg-surface shadow-card', className)} {...props} />
  );
}

export function CardHeader({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('border-b border-divider px-4 py-3', className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn('text-md font-semibold text-primary', className)} {...props} />
  );
}

export function CardBody({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('px-4 py-3', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('border-t border-divider px-4 py-3', className)} {...props} />
  );
}
