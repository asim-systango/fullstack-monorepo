'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import type { Comment } from '@/lib/api/comments';
import { canPublish } from '@/lib/auth/roles';
import { formatRelativeTime } from '@/lib/format/date';
import { useAuthModal } from '@/components/auth/auth-modal-context';
import { useMe } from '@/hooks/use-auth';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '@/hooks/use-comments';

function initials(userId: string): string {
  return userId.slice(0, 2).toUpperCase();
}

function CommentItem({
  comment,
  articleId,
  canModerate,
  isOwner,
}: Readonly<{
  comment: Comment;
  articleId: string;
  canModerate: boolean;
  isOwner: boolean;
}>) {
  const updateMutation = useUpdateComment(articleId);
  const deleteMutation = useDeleteComment(articleId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [error, setError] = useState<string | null>(null);

  const canEdit = isOwner;
  const canDelete = isOwner || canModerate;

  async function handleSave() {
    setError(null);
    try {
      await updateMutation.mutateAsync({ commentId: comment.id, body: draft.trim() });
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save comment.');
    }
  }

  async function handleDelete() {
    setError(null);
    try {
      await deleteMutation.mutateAsync(comment.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not delete comment.');
    }
  }

  return (
    <li className="py-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface-muted text-xs font-medium text-body">
          {initials(comment.userId)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
            {comment.updatedAt !== comment.createdAt ? ' · edited' : ''}
          </p>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                aria-label="Edit comment"
                className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-border-strong focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={updateMutation.isPending}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setDraft(comment.body);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-body">{comment.body}</p>
          )}

          {!editing && (canEdit || canDelete) ? (
            <div className="mt-2 flex gap-3 text-sm">
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Only rendered for published articles — the API returns 404 for comments on a
 * draft, and the backend stays the authority on that rule.
 */
export function CommentSection({ articleId }: Readonly<{ articleId: string }>) {
  const { data: user } = useMe();
  const { openAuth } = useAuthModal();
  const { data, isLoading, isError } = useComments(articleId);
  const createMutation = useCreateComment(articleId);

  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const comments = data?.data ?? [];

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (!trimmed) return;

    try {
      await createMutation.mutateAsync(trimmed);
      setBody('');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not post comment.');
    }
  }

  return (
    <section className="mx-auto mt-16 max-w-content border-t border-border pt-10">
      <h2 className="font-display text-2xl font-bold text-foreground">
        Comments{data ? ` (${data.total})` : ''}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="new-comment" className="sr-only">
            Write a comment
          </label>
          <textarea
            id="new-comment"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Write a comment…"
            className="w-full rounded-lg border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending}
              disabled={body.trim().length === 0}
            >
              Post Comment
            </Button>
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="mt-6 rounded-lg border border-border bg-surface-muted/40 p-5 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="font-medium text-foreground underline"
          >
            Sign in
          </button>{' '}
          to join the conversation.
        </p>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading comments…</p>
      ) : null}

      {isError ? (
        <p className="mt-8 text-sm text-red-600" role="alert">
          Could not load comments.
        </p>
      ) : null}

      {!isLoading && !isError && comments.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </p>
      ) : null}

      {comments.length > 0 ? (
        <ul className="mt-4 divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              isOwner={comment.userId === user?.id}
              canModerate={user ? canPublish(user.role) : false}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
