import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@shared/ui';

type ButtonLinkProps = Readonly<{
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}>;

// a link that looks like the kit's Button (navigation should be a link, not a button)
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'ui-button no-underline hover:no-underline',
        `ui-button-${size}`,
        `ui-button-${variant}`,
        className,
      )}
    >
      {children}
    </Link>
  );
}
