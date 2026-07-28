import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

type CardBoxProps = Readonly<HTMLAttributes<HTMLDivElement> & { children: ReactNode }>;

export function Card({ children, className, ...rest }: CardBoxProps) {
  return (
    <div className={cn('ui-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...rest }: CardBoxProps) {
  return (
    <div className={cn('ui-card-header', className)} {...rest}>
      {children}
    </div>
  );
}

export type CardTitleProps = Readonly<
  HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }
>;

export function CardTitle({ children, className, ...rest }: CardTitleProps) {
  return (
    <h2 className={cn('ui-card-title', className)} {...rest}>
      {children}
    </h2>
  );
}

export type CardDescriptionProps = Readonly<
  HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }
>;

export function CardDescription({ children, className, ...rest }: CardDescriptionProps) {
  return (
    <p className={cn('ui-card-description', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardBody({ children, className, ...rest }: CardBoxProps) {
  return (
    <div className={cn('ui-card-body', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...rest }: CardBoxProps) {
  return (
    <div className={cn('ui-card-footer', className)} {...rest}>
      {children}
    </div>
  );
}
