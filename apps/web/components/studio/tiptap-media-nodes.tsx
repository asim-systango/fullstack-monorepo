'use client';

import Image from 'next/image';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from '@tiptap/react';
import { TrashIcon } from './editor-icons';

const CAPTION_CLASS =
  'w-full border-0 bg-transparent p-0 text-center text-sm text-muted-foreground outline-none placeholder:text-muted-foreground';

function stopFormSubmit(event: { key: string; preventDefault(): void }): void {
  if (event.key === 'Enter') event.preventDefault();
}

function StoryImageView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: Readonly<ReactNodeViewProps>) {
  const { url, width, height, alt, caption } = node.attrs;

  return (
    <NodeViewWrapper>
      <figure
        className={
          selected ? 'rounded-lg ring-2 ring-border-strong ring-offset-2' : undefined
        }
      >
        {url ? (
          <Image
            src={url}
            alt={alt || 'Uploaded image'}
            width={width || 1600}
            height={height || 1000}
            className="h-auto w-full rounded-lg"
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-surface-muted text-sm text-muted-foreground">
            Image unavailable
          </div>
        )}
        <input
          value={caption ?? ''}
          aria-label="Image caption"
          placeholder="Type caption for image (optional)"
          className={`${CAPTION_CLASS} mt-2`}
          onKeyDown={stopFormSubmit}
          onChange={(event) => updateAttributes({ caption: event.target.value })}
        />
        <input
          value={alt ?? ''}
          aria-label="Image alt text"
          placeholder="Describe the image for screen readers (alt text)"
          className={`${CAPTION_CLASS} mt-1`}
          onKeyDown={stopFormSubmit}
          onChange={(event) => updateAttributes({ alt: event.target.value })}
        />
        <button
          type="button"
          aria-label="Remove image"
          title="Remove image"
          onClick={deleteNode}
          className="mt-2 ml-auto flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-red-600"
        >
          <TrashIcon className="size-4" />
        </button>
      </figure>
    </NodeViewWrapper>
  );
}

function StoryVideoView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: Readonly<ReactNodeViewProps>) {
  const { url, caption } = node.attrs;

  return (
    <NodeViewWrapper>
      <figure
        className={
          selected ? 'rounded-lg ring-2 ring-border-strong ring-offset-2' : undefined
        }
      >
        {url ? (
          <video src={url} controls className="w-full rounded-lg bg-black" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-surface-muted text-sm text-muted-foreground">
            Video unavailable
          </div>
        )}
        <input
          value={caption ?? ''}
          aria-label="Video caption"
          placeholder="Type caption for video (optional)"
          className={`${CAPTION_CLASS} mt-2`}
          onKeyDown={stopFormSubmit}
          onChange={(event) => updateAttributes({ caption: event.target.value })}
        />
        <button
          type="button"
          aria-label="Remove video"
          title="Remove video"
          onClick={deleteNode}
          className="mt-2 ml-auto flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-red-600"
        >
          <TrashIcon className="size-4" />
        </button>
      </figure>
    </NodeViewWrapper>
  );
}

export const StoryImage = Node.create({
  name: 'storyImage',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      mediaId: { default: null },
      url: { default: '' },
      width: { default: 1600 },
      height: { default: 1000 },
      alt: { default: '' },
      caption: { default: '' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="story-image"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'story-image' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StoryImageView);
  },
});

export const StoryVideo = Node.create({
  name: 'storyVideo',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      mediaId: { default: null },
      url: { default: '' },
      caption: { default: '' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="story-video"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'story-video' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StoryVideoView);
  },
});
