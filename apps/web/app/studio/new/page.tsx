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

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);

    const content = toArticleContent(blocks);
    if (content.length === 0) {
      setError('Add some content before saving this revision.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        content,
        ...(tagIds.length > 0 ? { tagIds } : {}),
      });
      router.push('/studio');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create article.');
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
        <Input
          label="Title"
          name="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
        />
        <Input
          label="Slug"
          name="slug"
          required
          hint="Lowercase letters, numbers, and hyphens"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
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

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
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
