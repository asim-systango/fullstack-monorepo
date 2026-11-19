'use client';

import Link from 'next/link';
import { ShellHeader, useAuth } from '@/components/auth';
import { Page, PageHeader } from '@shared/ui/components';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Page>
      <ShellHeader
        title="Online Auction House"
        subtitle="Bid fair. Sell clear. Win honestly."
      />
      <PageHeader
        title="Find your next win"
        description="Browse open auctions, place bids that respect the rules, or list an item if you are a seller."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/auctions"
              className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
            >
              Browse auctions
            </Link>
            {user?.role === 'staff' ? (
              <Link
                href="/seller/auctions/new"
                className="ui-button ui-button-md ui-button-secondary no-underline hover:no-underline"
              >
                New auction
              </Link>
            ) : null}
            {!user ? (
              <Link
                href="/login"
                className="ui-button ui-button-md ui-button-secondary no-underline hover:no-underline"
              >
                Log in
              </Link>
            ) : null}
          </div>
        }
      />
      <div className="mt-8 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
        <p>
          <strong className="text-foreground">Bidders</strong> — search open lots, place
          increment-safe bids, track wins on My bids.
        </p>
        <p>
          <strong className="text-foreground">Sellers</strong> — create listings, watch
          bid history, close auctions and record a winner.
        </p>
        <p>
          <strong className="text-foreground">Admins</strong> — cancel bad listings and
          soft-delete auctions from the public list.
        </p>
      </div>
      {user ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Signed in as {user.name} ({user.role}).
          {user.role === 'user' ? (
            <>
              {' '}
              <Link href="/my/bids">View my bids</Link>
            </>
          ) : null}
          {user.role === 'staff' ? (
            <>
              {' '}
              <Link href="/seller">Seller dashboard</Link>
            </>
          ) : null}
          {user.role === 'admin' ? (
            <>
              {' '}
              <Link href="/admin/auctions">Admin auctions</Link>
            </>
          ) : null}
        </p>
      ) : (
        <p className="mt-6 text-sm">
          <Link href="/register">Create a bidder account</Link>
        </p>
      )}
    </Page>
  );
}
