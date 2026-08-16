import type { ArticleMedia, PublicContentBlock } from '@/lib/api/articles';

/**
 * Studio revisions type their stored content as `unknown[]`, so narrow it here
 * once and let drafts and published articles share a single renderer.
 * Anything that does not match a known block shape is dropped rather than thrown on.
 */
export function toContentBlocks(raw: readonly unknown[]): PublicContentBlock[] {
  const blocks: PublicContentBlock[] = [];

  raw.forEach((entry, index) => {
    if (typeof entry !== 'object' || entry === null) return;

    const block = entry as Record<string, unknown>;
    const id = typeof block.id === 'string' ? block.id : `block-${index}`;

    switch (block.type) {
      case 'paragraph':
        if (typeof block.markdown === 'string') {
          blocks.push({ id, type: 'paragraph', markdown: block.markdown });
        }
        break;
      case 'heading':
        if (typeof block.text === 'string') {
          blocks.push({
            id,
            type: 'heading',
            level: toHeadingLevel(block.level),
            text: block.text,
          });
        }
        break;
      case 'code':
        if (typeof block.code === 'string') {
          blocks.push({
            id,
            type: 'code',
            code: block.code,
            language: typeof block.language === 'string' ? block.language : undefined,
          });
        }
        break;
      case 'image':
        if (typeof block.mediaId === 'string') {
          blocks.push({
            id,
            type: 'image',
            mediaId: block.mediaId,
            alt: typeof block.alt === 'string' ? block.alt : undefined,
            caption: typeof block.caption === 'string' ? block.caption : undefined,
          });
        }
        break;
      case 'video':
        if (typeof block.mediaId === 'string') {
          blocks.push({
            id,
            type: 'video',
            mediaId: block.mediaId,
            caption: typeof block.caption === 'string' ? block.caption : undefined,
          });
        }
        break;
      default:
        break;
    }
  });

  return blocks;
}

function toHeadingLevel(value: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
  return value === 1 || value === 3 || value === 4 || value === 5 || value === 6
    ? value
    : 2;
}

export function toMediaLookup(media: readonly ArticleMedia[]): Map<string, ArticleMedia> {
  return new Map(media.map((item) => [item.id, item]));
}
