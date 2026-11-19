'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { Button, TextInput } from '@shared/ui/components';
import { useAuth } from '@/components/auth';

export function HeroSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState('');

  function onSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = q.trim();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('status', 'open');
    const qs = params.toString();
    router.push(qs ? `/auctions?${qs}` : '/auctions');
  }

  return (
    <section
      aria-labelledby="hero-heading"
      className="rounded-lg border border-border bg-card px-5 py-8 sm:px-8 sm:py-10"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Auction House
        </p>
        <h2
          id="hero-heading"
          className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Discover. Bid. Win.
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Explore exciting auctions, discover unique products, and compete to win your
          next favorite item.
        </p>

        <form
          onSubmit={onSearch}
          className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-stretch"
          role="search"
        >
          <label htmlFor="hero-search" className="sr-only">
            Search auctions
          </label>
          <TextInput
            id="hero-search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or description"
            className="w-full flex-1"
          />
          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/auctions"
            className="ui-button ui-button-md ui-button-secondary no-underline hover:no-underline"
          >
            Browse Auctions
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
            >
              Sign in
            </Link>
          ) : null}
          {user?.role === 'staff' ? (
            <Link
              href="/seller/auctions/new"
              className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
            >
              Create Auction
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
