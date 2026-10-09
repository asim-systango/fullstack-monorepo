'use client';
import Link from 'next/link';
import { Badge, EmptyState, Page, Spinner } from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { useProjects } from '@/lib/domain/projects';
import { useIssues } from '@/lib/domain/issues';
import type { Issue } from '@/lib/domain/types';

type ProjectOpenIssuesProps = Readonly<{ projectId: string; userId: string }>;

function ProjectOpenIssues({ projectId, userId }: ProjectOpenIssuesProps) {
  const { data } = useIssues(projectId, { assigneeId: userId });
  const open = data?.filter((i): i is Issue => i.status !== 'done') ?? [];
  return (
    <>
      {open.map((i) => (
        <li key={i.id}>
          <Link href={`/issues/${i.id}`}>{i.title}</Link> <Badge>{i.status}</Badge>
        </li>
      ))}
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const projects = useProjects();

  if (!user)
    return (
      <Page>
        <Spinner />
      </Page>
    );

  return (
    <Page>
      <ShellHeader title="My issues" subtitle="Open work assigned to you" />
      {projects.isLoading && <Spinner />}
      {!projects.isLoading && projects.data?.length === 0 && (
        <EmptyState title="Nothing assigned" description="You have no open issues." />
      )}
      {!projects.isLoading && (projects.data?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-2">
          {projects.data?.map((p) => (
            <ProjectOpenIssues key={p.id} projectId={p.id} userId={user.id} />
          ))}
        </ul>
      )}
    </Page>
  );
}
