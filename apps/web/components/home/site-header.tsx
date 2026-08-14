import { Suspense } from 'react';
import Link from 'next/link';
import { pageGutter } from './page-gutter';
import { AuthHeaderActions } from './auth-header-actions';
import { HeaderSearch } from './header-search';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className={`flex min-h-[4.5rem] items-center gap-4 md:gap-5 ${pageGutter}`}>
        <Link
          href="/"
          className="shrink-0 font-display text-[2rem] font-bold leading-none tracking-tight text-foreground no-underline hover:no-underline md:text-[2.125rem]"
        >
          Wordnest
        </Link>

        <Suspense
          fallback={
            <div className="hidden min-w-0 flex-1 max-w-lg sm:block">
              <div className="h-11 rounded-pill bg-surface-muted" />
            </div>
          }
        >
          <HeaderSearch />
        </Suspense>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <AuthHeaderActions />
        </div>
      </div>
    </header>
  );
}
