import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';

export default function UnauthorizedPage() {
  return (
    <PageShell
      title="Access denied"
      description="Your account does not have permission for that page."
    >
      <div className="rounded-md bg-surface p-6 shadow-card">
        <Link
          className="text-sm font-medium text-brand hover:text-brand-hover"
          href="/jobs"
        >
          Back to jobs
        </Link>
      </div>
    </PageShell>
  );
}
