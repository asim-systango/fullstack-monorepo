'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { CloseIcon } from './editor-icons';
import { ApiClientError } from '@/lib/api';
import { useCreateTag, useTags } from '@/hooks/use-tags';

type TagPickerProps = {
  selectedIds: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
  /** Only editors and admins may create tags — POST /tags rejects authors. */
  allowCreate?: boolean;
};

export function TagPicker({
  selectedIds,
  onChange,
  disabled = false,
  allowCreate = false,
}: Readonly<TagPickerProps>) {
  const { data, isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const [newTagName, setNewTagName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tags = useMemo(() => data?.data ?? [], [data]);
  const selected = useMemo(
    () => tags.filter((tag) => selectedIds.includes(tag.id)),
    [tags, selectedIds],
  );
  const available = useMemo(
    () => tags.filter((tag) => !selectedIds.includes(tag.id)),
    [tags, selectedIds],
  );

  function remove(tagId: string) {
    onChange(selectedIds.filter((id) => id !== tagId));
  }

  function add(tagId: string) {
    if (!tagId || selectedIds.includes(tagId)) return;
    onChange([...selectedIds, tagId]);
  }

  async function handleCreate() {
    const name = newTagName.trim();
    if (!name) return;

    setError(null);
    try {
      const tag = await createTagMutation.mutateAsync(name);
      onChange([...selectedIds, tag.id]);
      setNewTagName('');
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create tag.');
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">Tags</p>

      <div className="flex flex-wrap items-center gap-2">
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 rounded-pill bg-surface-muted py-1 pr-1.5 pl-3 text-sm text-foreground"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => remove(tag.id)}
              disabled={disabled}
              aria-label={`Remove tag ${tag.name}`}
              className="rounded-pill p-0.5 text-muted-foreground hover:bg-border hover:text-foreground disabled:cursor-not-allowed"
            >
              <CloseIcon width={12} height={12} />
            </button>
          </span>
        ))}

        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Loading tags…' : 'No tags selected'}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {available.length > 0 ? (
          <select
            value=""
            disabled={disabled}
            onChange={(event) => add(event.target.value)}
            aria-label="Add a tag"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-border-strong focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">+ Add Tag</option>
            {available.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        ) : null}

        {allowCreate && !showCreate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => setShowCreate(true)}
          >
            New tag
          </Button>
        ) : null}

        {allowCreate && showCreate ? (
          <span className="flex items-center gap-2">
            <input
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Tag name"
              aria-label="New tag name"
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-border-strong focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={createTagMutation.isPending}
              onClick={handleCreate}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreate(false);
                setNewTagName('');
                setError(null);
              }}
            >
              Cancel
            </Button>
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
