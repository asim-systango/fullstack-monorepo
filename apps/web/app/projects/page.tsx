'use client';

import { useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
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
  TextInput,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader, useAuth } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { projectsApi } from '@/lib/domain-api';
import { ApiClientError } from '@shared/api-client';

function ProjectGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} size="lg" className="h-28 rounded-lg" />
      ))}
    </div>
  );
}

function ProjectsContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const canCreate = user?.role === 'staff' || user?.role === 'admin';

  const listQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () => projectsApi.create({ name, key: key.toUpperCase() }),
    onSuccess: async () => {
      setName('');
      setKey('');
      setFormError(null);
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: unknown) => {
      setFormError(err instanceof ApiClientError ? err.message : 'Create failed');
    },
  });

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Workspaces you belong to"
        actions={
          canCreate ? (
            <Button
              size="sm"
              variant={showCreate ? 'secondary' : 'primary'}
              onClick={() => setShowCreate((v) => !v)}
            >
              {showCreate ? 'Close' : 'New project'}
            </Button>
          ) : null
        }
      />

      {canCreate && showCreate ? (
        <Card className="tf-enter tf-panel mb-6">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
          </CardHeader>
          <CardBody>
            <Form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
              <Field label="Name" htmlFor="project-name">
                <TextInput
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field label="Key" htmlFor="project-key" hint="Uppercase, e.g. TF">
                <TextInput
                  id="project-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  required
                  maxLength={16}
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" loading={createMutation.isPending}>
                  Create
                </Button>
              </div>
            </Form>
            {formError ? (
              <Alert tone="danger" className="mt-3">
                {formError}
              </Alert>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {listQuery.isLoading ? <ProjectGridSkeleton /> : null}
      {listQuery.isError ? (
        <Alert tone="danger">
          {(listQuery.error as Error).message}
          <Button
            className="ml-2"
            size="sm"
            variant="secondary"
            onClick={() => void listQuery.refetch()}
          >
            Retry
          </Button>
        </Alert>
      ) : null}
      {listQuery.data && listQuery.data.items.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            canCreate
              ? 'Create your first project to invite the team.'
              : 'Ask a project lead to add you to a workspace.'
          }
          action={
            canCreate ? (
              <Button onClick={() => setShowCreate(true)}>New project</Button>
            ) : null
          }
        />
      ) : null}
      {listQuery.data && listQuery.data.items.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {listQuery.data.items.map((project, index) => (
            <li
              key={project.id}
              className={`tf-enter tf-enter-delay-${Math.min(index, 3) || 1}`}
            >
              <Card className="tf-card-lift tf-project-card h-full">
                <CardHeader>
                  <div className="mb-2">
                    <span className="tf-key-chip">{project.key}</span>
                  </div>
                  <CardTitle>
                    <Link
                      href={`/projects/${project.id}`}
                      className="no-underline hover:no-underline"
                    >
                      {project.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardBody className="flex gap-3 text-sm">
                  <Link href={`/projects/${project.id}/board`}>Board →</Link>
                  <Link href={`/projects/${project.id}/issues`}>Issues</Link>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default function ProjectsPage() {
  return (
    <TaskFlowPage wide>
      <ShellHeader />
      <RequireAuth>
        <ProjectsContent />
      </RequireAuth>
    </TaskFlowPage>
  );
}
