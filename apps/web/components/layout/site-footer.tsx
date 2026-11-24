import Link from 'next/link';
import { BROWSE_CATEGORIES } from '@/lib/auction-utils';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border pt-8 pb-4">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-foreground">Auction House</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover. Bid. Win. A fair marketplace for open auctions.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Explore</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/auctions">Browse Auctions</Link>
            </li>
            <li>
              <Link href="/#categories">Categories</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/register">Register</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Categories</p>
          <ul className="mt-2 space-y-2 text-sm">
            {BROWSE_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/auctions?category=${encodeURIComponent(category.slug)}&status=open`}
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        © {year} Auction House. All rights reserved.
      </p>
    </footer>
  );
}
