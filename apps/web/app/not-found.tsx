import Link from 'next/link';
import { SiteHeader } from '@/components/home';
import { pageGutter } from '@/components/home/page-gutter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className={`${pageGutter} py-24 text-center`}>
        <h1 className="font-display text-4xl font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          This page does not exist or is no longer available.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-pill border border-border-strong px-5 text-sm text-foreground no-underline hover:bg-surface-muted"
          >
            Back home
          </Link>
          <Link
            href="/blog"
            className="inline-flex h-10 items-center rounded-pill bg-button-primary px-5 text-sm font-medium text-button-primary-foreground no-underline hover:bg-foreground"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    </div>
  );
}
