'use client';
import { use } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Page,
  Spinner,
} from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import { useProjectMembers } from '@/lib/domain/projects';

export default function ProjectDetail({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const members = useProjectMembers(id);

  return (
    <Page>
      <ShellHeader title="Project" subtitle="Overview and members" />
      <div className="flex gap-2">
        <Link href={`/projects/${id}/board`}>
          <Button>Board</Button>
        </Link>
        <Link href={`/projects/${id}/issues`}>
          <Button variant="secondary">Issues</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        {members.isLoading ? (
          <Spinner />
        ) : (
          <ul>
            {members.data?.map((m) => (
              <li key={m.id}>
                {m.userId.slice(0, 8)} — {m.projectRole}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
