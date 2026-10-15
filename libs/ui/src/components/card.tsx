import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

type CardBoxProps = Readonly<HTMLAttributes<HTMLDivElement> & { children: ReactNode }>;

export function Card({ children, className, ...rest }: CardBoxProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs transition-all duration-200 hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...rest }: CardBoxProps) {
  return (
    <div className={cn('mb-4 space-y-1.5', className)} {...rest}>
      {children}
    </div>
  );
}

export type CardTitleProps = Readonly<
  HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }
>;

export function CardTitle({ children, className, ...rest }: CardTitleProps) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold tracking-tight text-card-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}

export type CardDescriptionProps = Readonly<
  HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }
>;

export function CardDescription({ children, className, ...rest }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardBody({ children, className, ...rest }: CardBoxProps) {
  return (
    <div className={cn('text-sm text-card-foreground', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...rest }: CardBoxProps) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
