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
  Separator,
  Spinner,
  StatusMessage,
  TextArea,
} from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import { useAddComment, useChangeStatus, useIssue } from '@/lib/domain/issues';
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
        {issue.labelIds.length > 0 && (
          <div className="mt-2 flex gap-2">
            {issue.labelIds.map((l) => (
              <Badge key={l}>{l.slice(0, 6)}</Badge>
            ))}
          </div>
        )}
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
