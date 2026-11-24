import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@shared/ui';

type ButtonLinkProps = Readonly<
  Omit<ComponentProps<typeof Link>, 'className'> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
    className?: string;
    children: ReactNode;
  }
>;

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        'ui-button no-underline hover:no-underline',
        size === 'sm' && 'ui-button-sm',
        size === 'md' && 'ui-button-md',
        variant === 'primary' && 'ui-button-primary',
        variant === 'secondary' && 'ui-button-secondary',
        variant === 'ghost' && 'ui-button-ghost',
        variant === 'danger' && 'ui-button-danger',
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
