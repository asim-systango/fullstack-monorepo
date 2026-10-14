import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
}: Readonly<{
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}>) {
  return (
    <main
      className={cn(
        'mx-auto min-h-[calc(100vh-3.25rem)] max-w-feed px-4 py-8',
        className,
      )}
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-secondary">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}
