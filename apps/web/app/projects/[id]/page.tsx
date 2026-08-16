'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Field,
  Form,
  Page,
  Select,
  Spinner,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { useAddMember, useProjectMembers, useRemoveMember } from '@/lib/domain/projects';
import { useCreateSprint, useSprints } from '@/lib/domain/sprints';
import { useCreateLabel, useDeleteLabel, useLabels } from '@/lib/domain/labels';

type Member = { id: string; userId: string; projectRole: string };

function MembersCard({
  projectId,
  canManage,
}: Readonly<{ projectId: string; canManage: boolean }>) {
  const members = useProjectMembers(projectId);
  const addMember = useAddMember(projectId);
  const removeMember = useRemoveMember(projectId);
  const [userId, setUserId] = useState('');
  const [projectRole, setProjectRole] = useState<'member' | 'project_lead'>('member');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      {members.isLoading && <Spinner />}
      {members.isError && (
        <StatusMessage tone="error">Failed to load members.</StatusMessage>
      )}
      <ul className="flex flex-col gap-1">
        {members.data?.map((m: Member) => (
          <li key={m.id} className="flex items-center gap-2">
            <span>
              {m.userId.slice(0, 8)} — {m.projectRole}
            </span>
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                loading={removeMember.isPending}
                onClick={() => removeMember.mutate(m.userId)}
              >
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>
      {removeMember.isError && (
        <StatusMessage tone="error">
          Cannot remove — the last project lead must remain.
        </StatusMessage>
      )}
      {canManage && (
        <Form
          pending={addMember.isPending}
          onSubmit={(e) => {
            e.preventDefault();
            addMember.mutate({ userId, projectRole }, { onSuccess: () => setUserId('') });
          }}
        >
          <Field label="User ID (UUID)" htmlFor="m-user" required>
            <TextInput
              id="m-user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="gateway user UUID"
            />
          </Field>
          <Field label="Role" htmlFor="m-role">
            <Select
              id="m-role"
              value={projectRole}
              onChange={(e) =>
                setProjectRole(e.target.value as 'member' | 'project_lead')
              }
            >
              <option value="member">Member</option>
              <option value="project_lead">Project lead</option>
            </Select>
          </Field>
          <Button type="submit" loading={addMember.isPending}>
            Add member
          </Button>
          {addMember.isError && (
            <StatusMessage tone="error">Add failed — check the UUID.</StatusMessage>
          )}
        </Form>
      )}
    </Card>
  );
}

function SprintsCard({
  projectId,
  canManage,
}: Readonly<{ projectId: string; canManage: boolean }>) {
  const sprints = useSprints(projectId);
  const createSprint = useCreateSprint(projectId);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprints</CardTitle>
      </CardHeader>
      {sprints.isLoading && <Spinner />}
      {sprints.isError && (
        <StatusMessage tone="error">Failed to load sprints.</StatusMessage>
      )}
      <ul className="flex flex-col gap-1">
        {sprints.data?.map((s) => (
          <li key={s.id}>
            {s.name}
            {s.startDate && (
              <span className="text-muted-foreground">
                {' '}
                · {s.startDate} → {s.endDate ?? '—'}
              </span>
            )}
          </li>
        ))}
        {sprints.data?.length === 0 && (
          <li className="text-muted-foreground">No sprints yet.</li>
        )}
      </ul>
      {canManage && (
        <Form
          pending={createSprint.isPending}
          onSubmit={(e) => {
            e.preventDefault();
            createSprint.mutate(
              { name, startDate: startDate || undefined, endDate: endDate || undefined },
              {
                onSuccess: () => {
                  setName('');
                  setStartDate('');
                  setEndDate('');
                },
              },
            );
          }}
        >
          <Field label="Name" htmlFor="s-name" required>
            <TextInput
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Start date" htmlFor="s-start">
            <TextInput
              id="s-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="End date" htmlFor="s-end">
            <TextInput
              id="s-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={createSprint.isPending}>
            Create sprint
          </Button>
        </Form>
      )}
    </Card>
  );
}

function LabelsCard({
  projectId,
  canManage,
}: Readonly<{ projectId: string; canManage: boolean }>) {
  const labels = useLabels(projectId);
  const createLabel = useCreateLabel(projectId);
  const deleteLabel = useDeleteLabel(projectId);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#888888');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
      </CardHeader>
      {labels.isLoading && <Spinner />}
      {labels.isError && (
        <StatusMessage tone="error">Failed to load labels.</StatusMessage>
      )}
      <ul className="flex flex-wrap gap-2">
        {labels.data?.map((l) => (
          <li key={l.id} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            {l.name}
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                loading={deleteLabel.isPending}
                onClick={() => deleteLabel.mutate(l.id)}
              >
                ×
              </Button>
            )}
          </li>
        ))}
        {labels.data?.length === 0 && (
          <li className="text-muted-foreground">No labels yet.</li>
        )}
      </ul>
      {canManage && (
        <Form
          pending={createLabel.isPending}
          onSubmit={(e) => {
            e.preventDefault();
            createLabel.mutate({ name, color }, { onSuccess: () => setName('') });
          }}
        >
          <Field label="Name" htmlFor="l-name" required>
            <TextInput
              id="l-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Color" htmlFor="l-color">
            <TextInput
              id="l-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={createLabel.isPending}>
            Create label
          </Button>
        </Form>
      )}
    </Card>
  );
}

export default function ProjectDetail({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const { user } = useAuth();
  const members = useProjectMembers(id);

  const isLead =
    members.data?.some(
      (m) => m.userId === user?.id && m.projectRole === 'project_lead',
    ) ?? false;
  const canManage = user?.role === 'admin' || isLead;

  return (
    <Page>
      <ShellHeader title="Project" subtitle="Overview, members, and sprints" />
      <div className="flex gap-2">
        <Link href={`/projects/${id}/board`}>
          <Button>Board</Button>
        </Link>
        <Link href={`/projects/${id}/issues`}>
          <Button variant="secondary">Issues</Button>
        </Link>
      </div>
      <MembersCard projectId={id} canManage={canManage} />
      <LabelsCard projectId={id} canManage={canManage} />
      <SprintsCard projectId={id} canManage={canManage} />
    </Page>
  );
}
