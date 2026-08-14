import { PageShell } from '@/components/layout/page-shell';

export default function AdminPage() {
  return (
    <PageShell title="Admin" description="Admin role only.">
      <div className="rounded-md bg-surface p-6 shadow-card">
        <p className="text-sm text-secondary">Admin UI will be built next.</p>
      </div>
    </PageShell>
  );
}
