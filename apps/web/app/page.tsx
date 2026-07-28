import { ShellHeader } from '@/components/auth/shell-header';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <ShellHeader title="Fullstack Boilerplate" />
      <p>
        Shared boilerplate: auth shell, TanStack Query + RTK providers, cookie JWT client.
        Build your assigned domain against the Nest domain API — see{' '}
        <code>docs/projects/</code>.
      </p>
      <ul className="muted">
        <li>
          Gateway owns cookie JWT auth; domain API owns persistence (Bearer via gateway).
        </li>
        <li>TanStack Query owns server lists/mutations.</li>
        <li>RTK owns drafts / filters / selection only.</li>
      </ul>
      <p>
        <Link href="/login">Log in</Link> with seed users, then add your feature routes
        under <code>apps/web/app</code>.
      </p>
    </main>
  );
}
