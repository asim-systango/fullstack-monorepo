import Link from 'next/link';
import { BROWSE_CATEGORIES } from '@/lib/auction-utils';

export function BrowseCategories() {
  return (
    <section id="categories" aria-labelledby="categories-heading" className="space-y-4">
      <div>
        <h2
          id="categories-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Browse by Categories
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump into a category to find auctions that match your interests.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {BROWSE_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/auctions?category=${encodeURIComponent(category.slug)}&status=open`}
            className="group flex flex-col rounded-lg border border-border bg-card p-4 no-underline transition-colors hover:border-foreground/20 hover:bg-muted/40"
          >
            <span
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-lg font-semibold text-foreground"
              aria-hidden
            >
              {category.label.charAt(0)}
            </span>
            <span className="font-medium text-foreground group-hover:underline">
              {category.label}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">{category.blurb}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
