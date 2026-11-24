import type { ReactNode } from 'react';

export function AuthLayout({
  brandTitle = 'Auction House',
  headline,
  description,
  children,
}: Readonly<{
  brandTitle?: string;
  headline: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
      <aside className="order-2 flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8 lg:order-1">
        <div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            {brandTitle}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {headline}
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2" aria-hidden>
          {['E', 'F', 'H', 'B', 'S', 'A'].map((letter, index) => (
            <div
              key={`${letter}-${index}`}
              className="flex aspect-square items-center justify-center rounded-md bg-muted text-lg font-semibold text-foreground/60"
            >
              {letter}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Discover. Bid. Win. — browse open auctions and compete fairly.
        </p>
      </aside>

      <div className="order-1 lg:order-2 lg:flex lg:items-center">
        <div className="w-full rounded-lg border border-border bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
