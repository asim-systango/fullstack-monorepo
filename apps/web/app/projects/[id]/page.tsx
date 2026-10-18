'use client';

import { useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Form,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader, useAuth } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { projectsApi } from '@/lib/domain-api';
import { ApiClientError } from '@shared/api-client';

function ProjectDetailContent() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId),
    enabled: Boolean(projectId),
  });

  const myMembership = projectQuery.data?.members?.find((m) => m.userId === user?.id);
  const isLead = myMembership?.role === 'lead' || user?.role === 'admin';

  const addMember = useMutation({
    mutationFn: () => projectsApi.addMember(projectId, { email, role: 'member' }),
    onSuccess: async () => {
      setEmail('');
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiClientError ? err.message : 'Could not add member');
    },
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: async () => {
      setRemoveUserId(null);
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiClientError ? err.message : 'Could not remove member');
    },
  });

  function onAdd(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    addMember.mutate();
  }

  if (projectQuery.isLoading) {
    return (
      <>
        <PageHeader title="Project" description="Loading…" />
        <Skeleton size="lg" className="mb-4 h-24" />
        <Skeleton size="lg" className="h-48" />
      </>
    );
  }

  if (projectQuery.isError) {
    return (
      <Alert tone="danger">
        {(projectQuery.error as Error).message}
        <Button
          size="sm"
          variant="secondary"
          className="ml-2"
          onClick={() => void projectQuery.refetch()}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  const project = projectQuery.data!;
  const members = project.members ?? [];

  return (
    <>
      <PageHeader
        title={`${project.key} · ${project.name}`}
        description="Members and shortcuts"
        actions={
          <>
            <Link href={`/projects/${projectId}/issues`}>Issues</Link>
            <Link href={`/projects/${projectId}/board`}>Board</Link>
          </>
        }
      />

      <Card className="tf-enter tf-panel">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {error ? <Alert tone="danger">{error}</Alert> : null}

          {members.length === 0 ? (
            <EmptyState title="No members" description="Invite someone by email." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>User ID</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">
                      {m.userId === user?.id
                        ? `${m.userId.slice(0, 8)}… (you)`
                        : m.userId}
                    </TableCell>
                    <TableCell>
                      <Badge tone={m.role === 'lead' ? 'accent' : 'neutral'}>
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isLead && m.userId !== user?.id ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRemoveUserId(m.userId)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isLead ? (
            <Form onSubmit={onAdd} className="flex flex-wrap items-end gap-2">
              <Field label="Invite by email" htmlFor="invite-email">
                <TextInput
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@demo.local"
                  required
                />
              </Field>
              <Button type="submit" loading={addMember.isPending}>
                Add member
              </Button>
            </Form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Only project leads can invite or remove members.
            </p>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={Boolean(removeUserId)}
        onOpenChange={(open) => {
          if (!open) setRemoveUserId(null);
        }}
        title="Remove member?"
        description="They will lose access to this project's issues immediately."
        confirmLabel="Remove"
        danger
        loading={removeMember.isPending}
        onConfirm={() => {
          if (removeUserId) removeMember.mutate(removeUserId);
        }}
      />
    </>
  );
}

export default function ProjectDetailPage() {
  return (
    <TaskFlowPage wide>
      <ShellHeader />
      <RequireAuth>
        <ProjectDetailContent />
      </RequireAuth>
    </TaskFlowPage>
  );
}
