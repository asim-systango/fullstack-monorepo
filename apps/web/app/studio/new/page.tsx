'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { useCreateArticle } from '@/hooks/use-studio';

const STUDIO_NAV = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

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
  const createMutation = useCreateArticle();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);

    try {
      const article = await createMutation.mutateAsync({
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        body: body.trim(),
      });
      router.push(`/studio/${article.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create article.');
    }
  }

  return (
    <DashboardShell
      title="Create Article"
      subtitle="Save a draft revision. Editors publish when ready."
      role="user"
      navItems={STUDIO_NAV}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="body" className="text-sm font-medium text-foreground">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
            placeholder="Write your article in markdown…"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" loading={createMutation.isPending}>
            Save Revision
          </Button>
          <Link
            href="/studio"
            className="inline-flex h-10 items-center px-4 text-sm underline"
          >
            Cancel
          </Link>
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
