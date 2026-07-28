import { ShellHeader } from '@/components/auth/shell-header';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
      <ShellHeader title="App starter" />
      <p className="text-foreground">
        Shared boilerplate: auth shell, TanStack Query + RTK providers, cookie JWT client.
        Build your assigned domain against the Nest domain API — see{' '}
        <code>docs/projects/</code>.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          Gateway owns cookie JWT auth; domain API owns persistence (Bearer via gateway).
        </li>
        <li>TanStack Query owns server lists/mutations.</li>
        <li>RTK owns drafts / filters / selection only.</li>
      </ul>
      <p className="mt-4">
        <Link href="/login">Log in</Link> with seed users, then add your feature routes
        under <code>apps/web/app</code>.
      </p>
    </main>
  );
}
