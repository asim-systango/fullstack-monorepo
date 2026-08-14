import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { Alert, EmptyState, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';

export function MemberSection({
  title,
  description,
  action,
  children,
  stagger = 0,
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  stagger?: number;
}>) {
  return (
    <section
      className="member-enter"
      style={{ '--member-stagger': stagger } as CSSProperties}
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-semibold tracking-tight text-[color:var(--bookly-navy)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 mb-0 text-sm text-[color:var(--bookly-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MemberLoadingGrid({ count = 4 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} size="lg" />
      ))}
    </div>
  );
}

export function MemberError({
  title,
  error,
}: Readonly<{ title: string; error: unknown }>) {
  return (
    <Alert tone="danger" title={title}>
      {toUserMessage(error)}
    </Alert>
  );
}

export function MemberEmpty({
  title,
  description,
  href,
  actionLabel,
}: Readonly<{
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
}>) {
  return (
    <div className="member-card p-6">
      <EmptyState title={title} description={description} />
      {href && actionLabel ? (
        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex rounded-md bg-[color:var(--bookly-teal)] px-4 py-2 text-sm font-semibold text-[color:var(--bookly-navy-deep)] no-underline hover:no-underline"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
