import type { ArticleMedia } from '@/lib/api/articles';
import type { ArticleContentBlock } from '@/lib/api/studio';

export type HeadingLevel = 1 | 2 | 3;

/**
 * Editor-side blocks. `id` keys the React list and `url` previews uploaded media —
 * both are local only; the API generates block ids and resolves media by `mediaId`.
 */
export type StoryBlock =
  | { id: string; type: 'paragraph'; markdown: string }
  | { id: string; type: 'heading'; level: HeadingLevel; text: string }
  | {
      id: string;
      type: 'image';
      mediaId: string;
      url: string;
      width: number;
      height: number;
      alt: string;
      caption: string;
    }
  | { id: string; type: 'video'; mediaId: string; url: string; caption: string }
  | { id: string; type: 'code'; code: string; language: string };

export type StoryBlockType = StoryBlock['type'];

/** Insertable from the "+" menu — media blocks come from an upload instead. */
export type InsertableBlockType = 'paragraph' | 'heading' | 'code';

let blockCounter = 0;

function nextBlockId(): string {
  blockCounter += 1;
  return `block-${blockCounter}`;
}

export function createParagraphBlock(): StoryBlock {
  return { id: nextBlockId(), type: 'paragraph', markdown: '' };
}

export function createBlock(type: InsertableBlockType): StoryBlock {
  if (type === 'heading') {
    return { id: nextBlockId(), type: 'heading', level: 2, text: '' };
  }
  if (type === 'code') {
    return { id: nextBlockId(), type: 'code', code: '', language: '' };
  }
  return createParagraphBlock();
}

export function createMediaBlock(media: {
  id: string;
  url: string;
  resourceType: 'image' | 'video';
  width?: number | null;
  height?: number | null;
  altText?: string | null;
}): StoryBlock {
  if (media.resourceType === 'video') {
    return {
      id: nextBlockId(),
      type: 'video',
      mediaId: media.id,
      url: media.url,
      caption: '',
    };
  }
  return {
    id: nextBlockId(),
    type: 'image',
    mediaId: media.id,
    url: media.url,
    width: media.width ?? 1600,
    height: media.height ?? 1000,
    alt: media.altText ?? '',
    caption: '',
  };
}

function toHeadingLevel(value: unknown): HeadingLevel {
  if (value === 1) return 1;
  if (value === 3) return 3;
  return 2;
}

/**
 * Rehydrates the editor from a saved revision. Stored blocks only carry `mediaId`,
 * so previews are restored from the resolved media shipped alongside the content.
 */
export function fromArticleContent(
  content: readonly unknown[],
  media: readonly ArticleMedia[] = [],
): StoryBlock[] {
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const blocks: StoryBlock[] = [];

  for (const entry of content) {
    if (typeof entry !== 'object' || entry === null) continue;
    const block = entry as Record<string, unknown>;

    switch (block.type) {
      case 'paragraph':
        blocks.push({
          id: nextBlockId(),
          type: 'paragraph',
          markdown: typeof block.markdown === 'string' ? block.markdown : '',
        });
        break;
      case 'heading':
        blocks.push({
          id: nextBlockId(),
          type: 'heading',
          level: toHeadingLevel(block.level),
          text: typeof block.text === 'string' ? block.text : '',
        });
        break;
      case 'code':
        blocks.push({
          id: nextBlockId(),
          type: 'code',
          code: typeof block.code === 'string' ? block.code : '',
          language: typeof block.language === 'string' ? block.language : '',
        });
        break;
      case 'image': {
        if (typeof block.mediaId !== 'string') break;
        const asset = mediaById.get(block.mediaId);
        blocks.push({
          id: nextBlockId(),
          type: 'image',
          mediaId: block.mediaId,
          url: asset?.secureUrl ?? '',
          width: asset?.width ?? 1600,
          height: asset?.height ?? 1000,
          alt: typeof block.alt === 'string' ? block.alt : (asset?.defaultAltText ?? ''),
          caption: typeof block.caption === 'string' ? block.caption : '',
        });
        break;
      }
      case 'video': {
        if (typeof block.mediaId !== 'string') break;
        const asset = mediaById.get(block.mediaId);
        blocks.push({
          id: nextBlockId(),
          type: 'video',
          mediaId: block.mediaId,
          url: asset?.secureUrl ?? '',
          caption: typeof block.caption === 'string' ? block.caption : '',
        });
        break;
      }
      default:
        break;
    }
  }

  return blocks.length > 0 ? blocks : [createParagraphBlock()];
}

function optional(field: string, value: string): Record<string, string> {
  const trimmed = value.trim();
  return trimmed ? { [field]: trimmed } : {};
}

/** Drops empty text blocks and strips editor-only fields for `POST /articles`. */
export function toArticleContent(blocks: readonly StoryBlock[]): ArticleContentBlock[] {
  const content: ArticleContentBlock[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph': {
        const markdown = block.markdown.trim();
        if (markdown) content.push({ type: 'paragraph', markdown });
        break;
      }
      case 'heading': {
        const text = block.text.trim();
        if (text) content.push({ type: 'heading', level: block.level, text });
        break;
      }
      case 'code': {
        const code = block.code.trim();
        if (code)
          content.push({ type: 'code', code, ...optional('language', block.language) });
        break;
      }
      case 'image':
        content.push({
          type: 'image',
          mediaId: block.mediaId,
          ...optional('alt', block.alt),
          ...optional('caption', block.caption),
        });
        break;
      case 'video':
        content.push({
          type: 'video',
          mediaId: block.mediaId,
          ...optional('caption', block.caption),
        });
        break;
    }
  }

  return content;
}
