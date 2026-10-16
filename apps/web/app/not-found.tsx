import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">That URL is not in Bookly.</p>
      <Link href="/" className="mt-6 inline-block text-sm underline">
        Home
      </Link>
    </main>
  );
}
