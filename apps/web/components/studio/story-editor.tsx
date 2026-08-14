'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { cn } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { uploadMedia } from '@/lib/api/media';
import {
  CloseIcon,
  CodeIcon,
  HeadingIcon,
  ImageIcon,
  PlusIcon,
  TextIcon,
  TrashIcon,
  VideoIcon,
} from './editor-icons';
import {
  createBlock,
  createMediaBlock,
  createParagraphBlock,
  type HeadingLevel,
  type StoryBlock,
} from './story-blocks';

const CAPTION_CLASS =
  'w-full border-0 bg-transparent p-0 text-center text-sm text-muted-foreground outline-none placeholder:text-muted-foreground';

const ROUND_BUTTON_CLASS =
  'flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40';

const HEADING_LEVELS: readonly HeadingLevel[] = [1, 2, 3];

const INSERT_ACTIONS = [
  { key: 'paragraph', label: 'Add text', Icon: TextIcon },
  { key: 'heading', label: 'Add heading', Icon: HeadingIcon },
  { key: 'image', label: 'Add image', Icon: ImageIcon },
  { key: 'video', label: 'Add video', Icon: VideoIcon },
  { key: 'code', label: 'Add code', Icon: CodeIcon },
] as const;

type InsertAction = (typeof INSERT_ACTIONS)[number]['key'];

type AutoTextareaProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

function AutoTextarea({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  className,
  disabled,
}: Readonly<AutoTextareaProps>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => onValueChange(event.target.value)}
      className={cn(
        'w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground',
        className,
      )}
    />
  );
}

type InsertMenuProps = {
  open: boolean;
  uploading: boolean;
  disabled: boolean;
  onToggle: () => void;
  onSelect: (action: InsertAction) => void;
};

function InsertMenu({
  open,
  uploading,
  disabled,
  onToggle,
  onSelect,
}: Readonly<InsertMenuProps>) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={open}
        aria-label={open ? 'Close insert menu' : 'Insert block'}
        className={ROUND_BUTTON_CLASS}
      >
        {open ? <CloseIcon className="size-4" /> : <PlusIcon className="size-4" />}
      </button>

      {open
        ? INSERT_ACTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={label}
              disabled={disabled || uploading}
              onClick={() => onSelect(key)}
              className={cn(ROUND_BUTTON_CLASS, 'border-brand/50 text-brand')}
            >
              <Icon className="size-4" />
            </button>
          ))
        : null}

      {uploading ? (
        <span className="text-xs text-muted-foreground">Uploading…</span>
      ) : null}
    </div>
  );
}

type BlockBodyProps = {
  block: StoryBlock;
  disabled: boolean;
  onChange: (block: StoryBlock) => void;
};

function BlockBody({ block, disabled, onChange }: Readonly<BlockBodyProps>) {
  if (block.type === 'paragraph') {
    return (
      <AutoTextarea
        value={block.markdown}
        disabled={disabled}
        ariaLabel="Story text"
        placeholder="Tell your story…"
        className="font-serif text-xl leading-relaxed"
        onValueChange={(markdown) => onChange({ ...block, markdown })}
      />
    );
  }

  if (block.type === 'heading') {
    return (
      <div className="space-y-2">
        <AutoTextarea
          value={block.text}
          disabled={disabled}
          ariaLabel="Heading text"
          placeholder="Heading"
          className="font-display text-2xl font-bold tracking-tight"
          onValueChange={(text) => onChange({ ...block, text })}
        />
        <div className="flex gap-1.5">
          {HEADING_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              disabled={disabled}
              aria-pressed={block.level === level}
              onClick={() => onChange({ ...block, level })}
              className={cn(
                'rounded-pill border px-2.5 py-0.5 text-xs transition-colors',
                block.level === level
                  ? 'border-foreground text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {`H${level}`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'code') {
    return (
      <div className="rounded-lg bg-surface-muted p-4">
        <AutoTextarea
          value={block.code}
          disabled={disabled}
          ariaLabel="Code"
          placeholder="Paste or write code…"
          className="font-mono text-sm"
          onValueChange={(code) => onChange({ ...block, code })}
        />
        <input
          value={block.language}
          disabled={disabled}
          aria-label="Code language"
          placeholder="Language (optional)"
          onChange={(event) => onChange({ ...block, language: event.target.value })}
          className="mt-3 w-full border-0 bg-transparent p-0 text-xs text-muted-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <figure className="space-y-2">
        <Image
          src={block.url}
          alt={block.alt || 'Uploaded image'}
          width={block.width}
          height={block.height}
          className="h-auto w-full rounded-lg"
        />
        <input
          value={block.caption}
          disabled={disabled}
          aria-label="Image caption"
          placeholder="Type caption for image (optional)"
          onChange={(event) => onChange({ ...block, caption: event.target.value })}
          className={CAPTION_CLASS}
        />
        <input
          value={block.alt}
          disabled={disabled}
          aria-label="Image alt text"
          placeholder="Describe the image for screen readers (alt text)"
          onChange={(event) => onChange({ ...block, alt: event.target.value })}
          className={CAPTION_CLASS}
        />
      </figure>
    );
  }

  return (
    <figure className="space-y-2">
      <video src={block.url} controls className="w-full rounded-lg bg-black" />
      <input
        value={block.caption}
        disabled={disabled}
        aria-label="Video caption"
        placeholder="Type caption for video (optional)"
        onChange={(event) => onChange({ ...block, caption: event.target.value })}
        className={CAPTION_CLASS}
      />
    </figure>
  );
}

export type StoryEditorProps = {
  blocks: readonly StoryBlock[];
  onBlocksChange: (blocks: StoryBlock[]) => void;
  disabled?: boolean;
};

export function StoryEditor({
  blocks,
  onBlocksChange,
  disabled = false,
}: Readonly<StoryEditorProps>) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pendingIndexRef = useRef<number | null>(null);

  function insertAfter(index: number, ...added: StoryBlock[]) {
    const next = [...blocks];
    next.splice(index + 1, 0, ...added);
    onBlocksChange(next);
  }

  function replaceBlock(index: number, block: StoryBlock) {
    const next = [...blocks];
    next[index] = block;
    onBlocksChange(next);
  }

  function removeBlock(index: number) {
    const next = blocks.filter((_, position) => position !== index);
    onBlocksChange(next.length > 0 ? next : [createParagraphBlock()]);
  }

  function requestUpload(index: number, kind: 'image' | 'video') {
    pendingIndexRef.current = index;
    const input = kind === 'image' ? imageInputRef.current : videoInputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const index = pendingIndexRef.current;
    pendingIndexRef.current = null;
    if (!file || index === null) return;

    setUploadError(null);
    setUploadingId(blocks[index]?.id ?? null);

    try {
      const media = await uploadMedia(file);
      const trailing = index === blocks.length - 1 ? [createParagraphBlock()] : [];
      insertAfter(index, createMediaBlock(media), ...trailing);
    } catch (error) {
      setUploadError(
        error instanceof ApiClientError ? error.message : 'Could not upload that file.',
      );
    } finally {
      setUploadingId(null);
    }
  }

  function handleInsert(index: number, action: InsertAction) {
    setOpenMenuId(null);
    if (action === 'image' || action === 'video') {
      requestUpload(index, action);
      return;
    }
    insertAfter(index, createBlock(action));
  }

  return (
    <div className="space-y-1">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelected}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={handleFileSelected}
      />

      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="group relative rounded-lg border-l-2 border-transparent py-2 pr-10 pl-4 transition-colors focus-within:border-border"
        >
          <BlockBody
            block={block}
            disabled={disabled}
            onChange={(updated) => replaceBlock(index, updated)}
          />

          <div className="mt-2">
            <InsertMenu
              open={openMenuId === block.id}
              uploading={uploadingId === block.id}
              disabled={disabled}
              onToggle={() => setOpenMenuId(openMenuId === block.id ? null : block.id)}
              onSelect={(action) => handleInsert(index, action)}
            />
          </div>

          <button
            type="button"
            aria-label="Remove block"
            title="Remove block"
            disabled={disabled || blocks.length === 1}
            onClick={() => removeBlock(index)}
            className="absolute top-2 right-0 flex size-7 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-red-600 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      ))}

      {uploadError ? (
        <p className="pl-4 text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
