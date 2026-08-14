import { PageShell } from '@/components/layout/page-shell';

export default function ApplicationsPage() {
  return (
    <PageShell title="My applications" description="User role only.">
      <div className="rounded-md bg-surface p-6 shadow-card">
        <p className="text-sm text-secondary">Applications UI will be built next.</p>
      </div>
    </PageShell>
  );
}
