import Link from 'next/link';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.25rem)] max-w-feed flex-col justify-center px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Job Portal
      </p>
      <h1 className="mt-2 max-w-2xl text-2xl font-semibold text-primary">
        Find your next role — or hire the people who will build it.
      </h1>
      <p className="mt-3 max-w-xl text-sm text-secondary">
        Browse open positions, apply with a saved resume, or manage company hiring from
        one place.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/jobs">
          <Button>Browse jobs</Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary">Join as candidate</Button>
        </Link>
      </div>
    </main>
  );
}
