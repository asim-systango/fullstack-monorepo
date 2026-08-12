'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, type MouseEvent, type ReactNode } from 'react';

type NavLinkProps = Omit<ComponentProps<typeof Link>, 'prefetch' | 'onClick'> & {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Client navigation only — never triggers auth APIs.
 * Prefetch is off so hovering/clicking does not look like a backend call.
 */
export function NavLink({ href, children, onClick, ...rest }: NavLinkProps) {
  const router = useRouter();

  return (
    <Link
      {...rest}
      href={href}
      prefetch={false}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        router.push(typeof href === 'string' ? href : href.pathname || '/');
      }}
    >
      {children}
    </Link>
  );
}
