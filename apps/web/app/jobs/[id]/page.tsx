import { PageShell } from '@/components/layout/page-shell';

type JobDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  return (
    <PageShell title="Job detail" description={`Public job detail for ${id}.`}>
      <div className="rounded-md bg-surface p-6 shadow-card">
        <p className="text-sm text-secondary">Job detail UI will be built next.</p>
      </div>
    </PageShell>
  );
}
