'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { StoryEditor } from '@/components/studio/story-editor';
import {
  createParagraphBlock,
  toArticleContent,
  type StoryBlock,
} from '@/components/studio/story-blocks';
import { getStudioWorkspace } from '@/components/studio/studio-nav';
import { TagPicker } from '@/components/studio/tag-picker';
import { Button, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { useCreateArticle } from '@/hooks/use-studio';
import { useMe } from '@/hooks/use-auth';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

function messageFromUnknown(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError && err.message.trim()) return err.message;
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

function isTitleTaken(err: unknown): boolean {
  if (!(err instanceof ApiClientError)) return false;
  return err.statusCode === 409 || /already exists/i.test(err.message);
}

const TITLE_TAKEN =
  'An article with this title already exists. Change the title and try again.';

function CreateArticleContent() {
  const router = useRouter();
  const { data: user } = useMe();
  const workspace = getStudioWorkspace(user?.role);
  const createMutation = useCreateArticle();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState<StoryBlock[]>(() => [createParagraphBlock()]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    setTitleError(null);

    const content = toArticleContent(blocks);
    if (content.length === 0) {
      setError('Add some content before saving this draft.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        slug: slugify(title),
        content,
        ...(tagIds.length > 0 ? { tagIds } : {}),
      });
      router.push('/studio');
    } catch (err) {
      if (isTitleTaken(err)) {
        setTitleError(TITLE_TAKEN);
        setError(TITLE_TAKEN);
        return;
      }
      setError(messageFromUnknown(err, 'Could not create article.'));
    }
  }

  return (
    <DashboardShell
      title="Create Article"
      subtitle={workspace.createSubtitle}
      role={workspace.role}
      navItems={workspace.navItems}
      actions={
        <>
          <Link
            href="/studio"
            className="inline-flex h-10 items-center px-4 text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            form="create-article-form"
            variant="primary"
            loading={createMutation.isPending}
          >
            Save Draft
          </Button>
        </>
      }
    >
      {/* id lets the Save Draft button in the page header submit this form */}
      <form
        id="create-article-form"
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-4"
      >
        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Input
          label="Title"
          name="title"
          required
          error={titleError ?? undefined}
          value={title}
          onChange={(e) => {
            const nextTitle = e.target.value;
            setTitle(nextTitle);
            if (titleError) setTitleError(null);
            setSlug(slugify(nextTitle));
          }}
        />
        <Input
          label="Slug"
          name="slug"
          required
          readOnly
          hint="Generated from the title."
          value={slug}
        />

        <TagPicker
          selectedIds={tagIds}
          onChange={setTagIds}
          disabled={createMutation.isPending}
          allowCreate={workspace.isEditor}
        />

        <div className="flex flex-col gap-1.5 pt-2">
          <p className="text-sm font-medium text-foreground">Story</p>
          <p className="text-xs text-muted-foreground">
            Use the toolbar to format text, add lists, or insert images and video.
          </p>
          <div className="mt-2">
            <StoryEditor
              blocks={blocks}
              onBlocksChange={setBlocks}
              disabled={createMutation.isPending}
            />
          </div>
        </div>
      </form>
    </DashboardShell>
  );
}

export default function CreateArticlePage() {
  return (
    <StudioGuard>
      <CreateArticleContent />
    </StudioGuard>
  );
}
