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
  TextInput,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader, useAuth } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageFetchSkeleton } from '@/components/content-skeletons';
import { projectsApi } from '@/lib/domain-api';
import type { ProjectMember } from '@/lib/domain-types';
import { ApiClientError } from '@shared/api-client';

function memberInitials(member: ProjectMember) {
  const source = member.name?.trim() || member.email?.trim() || member.userId;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '');
  return letters.toUpperCase();
}

function memberPrimary(member: ProjectMember) {
  return (
    member.name?.trim() || member.email?.trim() || `User ${member.userId.slice(0, 8)}`
  );
}

function memberSecondary(member: ProjectMember) {
  if (member.name?.trim() && member.email?.trim()) return member.email;
  return null;
}

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
        <PageHeader title="Project" description="Loading workspace…" />
        <PageFetchSkeleton label="Loading members…" />
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

      <Card className="tf-enter tf-panel tf-members-panel">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {error ? <Alert tone="danger">{error}</Alert> : null}

          {members.length === 0 ? (
            <EmptyState title="No members" description="Invite someone by email." />
          ) : (
            <ul className="tf-member-list">
              {members.map((m) => (
                <li key={m.id} className="tf-member-row">
                  <span className="tf-member-avatar" aria-hidden>
                    {memberInitials(m)}
                  </span>
                  <div className="tf-member-copy">
                    <p className="tf-member-name">
                      {memberPrimary(m)}
                      {m.userId === user?.id ? (
                        <span className="tf-member-you">you</span>
                      ) : null}
                    </p>
                    {memberSecondary(m) ? (
                      <p className="tf-member-email">{memberSecondary(m)}</p>
                    ) : null}
                  </div>
                  <Badge tone={m.role === 'lead' ? 'accent' : 'neutral'}>{m.role}</Badge>
                  {isLead && m.userId !== user?.id ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRemoveUserId(m.userId)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {isLead ? (
            <div className="tf-invite-box">
              <p className="tf-invite-title">Invite a member</p>
              <p className="tf-invite-help">
                They must already have an account (e.g. <code>user@demo.local</code>).
              </p>
              <Form onSubmit={onAdd} className="tf-invite-form">
                <Field label="Email" htmlFor="invite-email">
                  <TextInput
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@demo.local"
                    required
                  />
                </Field>
                <Button type="submit" loading={addMember.isPending}>
                  Add member
                </Button>
              </Form>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You&apos;re a member on this project. Log in as the project{' '}
              <strong>lead</strong> (<code>staff@demo.local</code>) to invite or remove
              people.
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
