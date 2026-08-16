'use client';
import { use, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Field,
  Form,
  Page,
  Select,
  Separator,
  Spinner,
  StatusMessage,
  TextArea,
} from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import {
  useAddComment,
  useAddIssueLabel,
  useAssignSprint,
  useChangeStatus,
  useIssue,
  useRemoveIssueLabel,
} from '@/lib/domain/issues';
import { useLabels } from '@/lib/domain/labels';
import { useSprints } from '@/lib/domain/sprints';
import { nextStatuses } from '@/lib/domain/types';

const LABELS: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

type MoveBtnProps = Readonly<{
  to: string;
  issueId: string;
  projectId: string;
  isPending: boolean;
}>;

function MoveBtn({ to, issueId, projectId, isPending }: MoveBtnProps) {
  const changeStatus = useChangeStatus(projectId);
  return (
    <Button
      variant="secondary"
      loading={isPending}
      onClick={() => changeStatus.mutate({ id: issueId, status: to })}
    >
      Move to {LABELS[to]}
    </Button>
  );
}

type LabelEditorProps = Readonly<{
  issueId: string;
  projectId: string;
  labelIds: string[];
}>;

function LabelEditor({ issueId, projectId, labelIds }: LabelEditorProps) {
  const labels = useLabels(projectId);
  const addLabel = useAddIssueLabel(issueId);
  const removeLabel = useRemoveIssueLabel(issueId);
  const applied = new Set(labelIds);
  const available = labels.data?.filter((l) => !applied.has(l.id)) ?? [];
  const nameOf = (lid: string) =>
    labels.data?.find((l) => l.id === lid)?.name ?? lid.slice(0, 6);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {labelIds.map((lid) => (
        <Badge key={lid}>
          {nameOf(lid)}
          <button
            type="button"
            className="ml-1"
            aria-label={`Remove ${nameOf(lid)}`}
            onClick={() => removeLabel.mutate(lid)}
          >
            ×
          </button>
        </Badge>
      ))}
      {available.length > 0 && (
        <Select
          value=""
          disabled={addLabel.isPending}
          onChange={(e) => e.target.value && addLabel.mutate(e.target.value)}
        >
          <option value="">+ Add label</option>
          {available.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}

type SprintPickerProps = Readonly<{
  issueId: string;
  projectId: string;
  currentSprintId: string | null;
}>;

function SprintPicker({ issueId, projectId, currentSprintId }: SprintPickerProps) {
  const sprints = useSprints(projectId);
  const assignSprint = useAssignSprint(issueId);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint</CardTitle>
      </CardHeader>
      {sprints.isLoading && <Spinner />}
      <Select
        value={currentSprintId ?? ''}
        disabled={assignSprint.isPending}
        onChange={(e) => assignSprint.mutate(e.target.value || null)}
      >
        <option value="">No sprint</option>
        {sprints.data?.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
    </Card>
  );
}

export default function IssuePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const { data: issue, isLoading, isError } = useIssue(id);
  const changeStatus = useChangeStatus(issue?.projectId ?? '');
  const addComment = useAddComment(id);
  const [body, setBody] = useState('');

  if (isLoading)
    return (
      <Page>
        <Spinner />
      </Page>
    );
  if (isError || !issue)
    return (
      <Page>
        <StatusMessage tone="error">This issue is no longer available.</StatusMessage>
      </Page>
    );

  return (
    <Page>
      <ShellHeader title={issue.title} subtitle={`Status: ${LABELS[issue.status]}`} />

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <p>{issue.description || 'No description.'}</p>
        <LabelEditor issueId={id} projectId={issue.projectId} labelIds={issue.labelIds} />
        <div className="mt-3 flex gap-2">
          {nextStatuses(issue.status).map((to) => (
            <MoveBtn
              key={to}
              to={to}
              issueId={id}
              projectId={issue.projectId}
              isPending={changeStatus.isPending}
            />
          ))}
        </div>
      </Card>

      <SprintPicker
        issueId={id}
        projectId={issue.projectId}
        currentSprintId={issue.sprintId}
      />

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <ul className="flex flex-col gap-1 text-sm">
          {issue.activity.map((a) => (
            <li key={a.id}>
              {a.fromStatus ?? 'created'} → {a.toStatus} ·{' '}
              {new Date(a.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <ul className="flex flex-col gap-2">
          {issue.comments.map((c) => (
            <li key={c.id}>
              <p>{c.body}</p>
              <Separator />
            </li>
          ))}
        </ul>
        <Form
          pending={addComment.isPending}
          onSubmit={(e) => {
            e.preventDefault();
            addComment.mutate(body, { onSuccess: () => setBody('') });
          }}
        >
          <Field label="Add a comment" htmlFor="c-body">
            <TextArea
              id="c-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={addComment.isPending}>
            Comment
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
