import type { ReactNode } from 'react';

export function PageShell({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description?: string;
  children?: ReactNode;
}>) {
  return (
    <main className="mx-auto min-h-screen max-w-feed px-4 py-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-primary">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-secondary">{description}</p>
        ) : null}
      </header>
      {children}
    </main>
  );
}
