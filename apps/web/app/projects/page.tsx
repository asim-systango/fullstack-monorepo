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
  TextInput,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader, useAuth } from '@/components/auth';
import { ConfettiBurst } from '@/components/auth/confetti-burst';
import { PageFetchSkeleton } from '@/components/content-skeletons';
import { EmptySparkArt, ProjectsHeroArt } from '@/components/tf-illustrations';
import { TaskFlowPage } from '@/components/taskflow-page';
import { projectsApi } from '@/lib/domain-api';
import { ApiClientError } from '@shared/api-client';

function ProjectsContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

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
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1600);
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

  const count = listQuery.data?.total ?? 0;

  return (
    <>
      <ConfettiBurst active={celebrate} />

      <div className="tf-domain-hero tf-enter">
        <div className="tf-domain-hero-copy">
          <PageHeader
            title="Projects"
            description="Workspaces you belong to — open a board, triage issues, invite the team."
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
          {listQuery.data ? (
            <p className="tf-stat-line">
              <span className="tf-stat-pill">{count}</span> active workspace
              {count === 1 ? '' : 's'}
            </p>
          ) : null}
        </div>
        <ProjectsHeroArt />
      </div>

      {canCreate && showCreate ? (
        <Card className="tf-enter tf-panel tf-create-project mb-6">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
          </CardHeader>
          <CardBody>
            <Form onSubmit={onSubmit} className="tf-create-project-form">
              <Field label="Name" htmlFor="project-name">
                <TextInput
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  placeholder="TaskFlow Core"
                />
              </Field>
              <Field
                label="Key"
                htmlFor="project-key"
                hint="Uppercase short code, e.g. TF"
              >
                <TextInput
                  id="project-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  required
                  maxLength={16}
                  placeholder="TF"
                />
              </Field>
              <div className="tf-create-project-actions">
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

      {listQuery.isLoading ? <PageFetchSkeleton label="Loading projects…" /> : null}
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
        <div className="tf-empty-stage tf-enter">
          <EmptySparkArt />
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
        </div>
      ) : null}
      {listQuery.data && listQuery.data.items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {listQuery.data.items.map((project, index) => (
            <li
              key={project.id}
              className={`tf-enter tf-enter-delay-${Math.min(index, 3) || 1}`}
            >
              <Card className="tf-card-lift tf-project-card tf-project-card-rich h-full">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="tf-key-chip">{project.key}</span>
                    <span className="tf-project-glow" aria-hidden />
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
                <CardBody className="flex flex-wrap gap-2 text-sm">
                  <Link href={`/projects/${project.id}/board`} className="tf-chip-link">
                    Board
                  </Link>
                  <Link href={`/projects/${project.id}/issues`} className="tf-chip-link">
                    Issues
                  </Link>
                  <Link
                    href={`/projects/${project.id}`}
                    className="tf-chip-link tf-chip-link-muted"
                  >
                    Overview
                  </Link>
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
