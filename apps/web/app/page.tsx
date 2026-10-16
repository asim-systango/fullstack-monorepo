import { ShellHeader } from '@/components/auth';
import { HomeLinks } from '@/components/home-links';
import { Page } from '@shared/ui/components';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Page>
      <ShellHeader title="Resume Builder" subtitle="Draft, preview, publish" />
      <p className="text-foreground">
        Build a resume with a live preview, switch among Classic / Modern / Compact
        templates, and publish a public link at <code>/r/[slug]</code>.
      </p>
      <HomeLinks />
      <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          Seed users: <code>user@demo.local</code>, <code>admin@demo.local</code> —
          password <code>password123</code>
        </li>
        <li>
          Prefer <Link href="/ui">@shared/ui/components</Link> over one-off styles.
        </li>
      </ul>
    </Page>
  );
}
