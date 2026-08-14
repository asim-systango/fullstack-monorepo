'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchIcon } from './icons';

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(queryFromUrl);

  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/blog?q=${encodeURIComponent(q)}` : '/blog');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative hidden min-w-0 flex-1 max-w-lg sm:block"
    >
      <label htmlFor="header-search" className="sr-only">
        Search articles
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="header-search"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        className="h-11 w-full rounded-pill border-0 bg-surface-muted pr-4 pl-10 text-[0.9375rem] text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      />
    </form>
  );
}
