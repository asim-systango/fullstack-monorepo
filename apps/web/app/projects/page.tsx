'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  Page,
  Spinner,
  StatusMessage,
  TextInput,
  Field,
  Form,
} from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { useCreateProject, useProjects } from '@/lib/domain/projects';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useProjects();
  const create = useCreateProject();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const canCreate = user?.role === 'staff' || user?.role === 'admin';

  return (
    <Page>
      <ShellHeader title="Projects" subtitle="Projects you belong to" />
      {canCreate && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>New project</CardTitle>
          </CardHeader>
          <Form
            pending={create.isPending}
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate(
                { name, key },
                {
                  onSuccess: () => {
                    setName('');
                    setKey('');
                  },
                },
              );
            }}
          >
            <Field label="Name" htmlFor="p-name" required>
              <TextInput
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Key" htmlFor="p-key" required>
              <TextInput
                id="p-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </Field>
            <Button type="submit" loading={create.isPending}>
              Create
            </Button>
          </Form>
        </Card>
      )}
      {isLoading && <Spinner />}
      {isError && <StatusMessage tone="error">Failed to load projects.</StatusMessage>}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="You are not a member of any project."
        />
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {data?.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/projects/${p.id}`}>
                  {p.name} <span className="text-muted-foreground">({p.key})</span>
                </Link>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Page>
  );
}
