import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  markdown: string;
};

export type HeadingBlock = {
  id: string;
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

export type ImageBlock = {
  id: string;
  type: 'image';
  mediaId: string;
  alt?: string;
  caption?: string;
};

export type VideoBlock = {
  id: string;
  type: 'video';
  mediaId: string;
  caption?: string;
};

export type CodeBlock = {
  id: string;
  type: 'code';
  code: string;
  language?: string;
};

export type ContentBlock =
  ParagraphBlock | HeadingBlock | ImageBlock | VideoBlock | CodeBlock;

export type MediaRef = {
  blockId: string;
  mediaId: string;
  expectedResourceType: 'image' | 'video';
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Convert API `body` markdown into a single paragraph block. */
export function markdownToContentBlocks(body: string): ContentBlock[] {
  return [
    {
      id: randomUUID(),
      type: 'paragraph',
      markdown: body,
    },
  ];
}

/** Collect inline media references from content blocks. */
export function collectMediaRefs(blocks: ContentBlock[]): MediaRef[] {
  const refs: MediaRef[] = [];
  for (const block of blocks) {
    if (block.type === 'image') {
      refs.push({
        blockId: block.id,
        mediaId: block.mediaId,
        expectedResourceType: 'image',
      });
    } else if (block.type === 'video') {
      refs.push({
        blockId: block.id,
        mediaId: block.mediaId,
        expectedResourceType: 'video',
      });
    }
  }
  return refs;
}

/**
 * Validate and normalize a Medium-style ordered block array.
 * Generates missing block ids; rejects unknown types / bad shapes.
 */
export function parseContentBlocks(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new BadRequestException({
      message: 'content must be a non-empty array of blocks',
    });
  }

  const blocks: ContentBlock[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i];
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new BadRequestException({
        message: `content[${i}] must be an object`,
      });
    }

    const block = item as Record<string, unknown>;
    const type = block.type;
    const id = normalizeBlockId(block.id, i);

    if (seenIds.has(id)) {
      throw new BadRequestException({
        message: 'content block ids must be unique',
        details: { id },
      });
    }
    seenIds.add(id);

    switch (type) {
      case 'paragraph': {
        const markdown = requireNonEmptyString(block.markdown, i, 'markdown');
        blocks.push({ id, type: 'paragraph', markdown });
        break;
      }
      case 'heading': {
        const text = requireNonEmptyString(block.text, i, 'text');
        const level = block.level;
        if (
          typeof level !== 'number' ||
          !Number.isInteger(level) ||
          level < 1 ||
          level > 6
        ) {
          throw new BadRequestException({
            message: `content[${i}].level must be an integer from 1 to 6`,
          });
        }
        blocks.push({
          id,
          type: 'heading',
          level: level as 1 | 2 | 3 | 4 | 5 | 6,
          text,
        });
        break;
      }
      case 'image': {
        const mediaId = requireUuid(block.mediaId, i, 'mediaId');
        const image: ImageBlock = { id, type: 'image', mediaId };
        if (block.alt !== undefined) {
          image.alt = requireOptionalString(block.alt, i, 'alt');
        }
        if (block.caption !== undefined) {
          image.caption = requireOptionalString(block.caption, i, 'caption');
        }
        blocks.push(image);
        break;
      }
      case 'video': {
        const mediaId = requireUuid(block.mediaId, i, 'mediaId');
        const video: VideoBlock = { id, type: 'video', mediaId };
        if (block.caption !== undefined) {
          video.caption = requireOptionalString(block.caption, i, 'caption');
        }
        blocks.push(video);
        break;
      }
      case 'code': {
        const code = requireNonEmptyString(block.code, i, 'code');
        const codeBlock: CodeBlock = { id, type: 'code', code };
        if (block.language !== undefined) {
          codeBlock.language = requireOptionalString(block.language, i, 'language');
        }
        blocks.push(codeBlock);
        break;
      }
      default:
        throw new BadRequestException({
          message: `content[${i}].type must be one of: paragraph, heading, image, video, code`,
          details: { type },
        });
    }
  }

  return blocks;
}

function normalizeBlockId(value: unknown, index: number): string {
  if (value === undefined || value === null || value === '') {
    return randomUUID();
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException({
      message: `content[${index}].id must be a non-empty string when provided`,
    });
  }
  if (value.trim() === 'cover') {
    throw new BadRequestException({
      message: `content[${index}].id cannot be "cover" (reserved for cover media)`,
    });
  }
  return value.trim();
}

function requireNonEmptyString(value: unknown, index: number, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException({
      message: `content[${index}].${field} must be a non-empty string`,
    });
  }
  return value.trim();
}

function requireOptionalString(value: unknown, index: number, field: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException({
      message: `content[${index}].${field} must be a string when provided`,
    });
  }
  return value.trim();
}

function requireUuid(value: unknown, index: number, field: string): string {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    throw new BadRequestException({
      message: `content[${index}].${field} must be a valid UUID`,
    });
  }
  return value;
}
