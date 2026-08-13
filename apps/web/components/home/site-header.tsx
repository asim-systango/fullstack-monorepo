import Link from 'next/link';
import { SearchIcon } from './icons';
import { pageGutter } from './page-gutter';
import { AuthHeaderActions } from './auth-header-actions';

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

        <label className="relative hidden min-w-0 flex-1 max-w-lg sm:block">
          <span className="sr-only">Search</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search"
            className="h-11 w-full rounded-pill border-0 bg-surface-muted pr-4 pl-10 text-[0.9375rem] text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <AuthHeaderActions />
        </div>
      </div>
    </header>
  );
}
