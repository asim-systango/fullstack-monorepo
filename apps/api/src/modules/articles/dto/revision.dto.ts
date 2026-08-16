import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ContentBlock } from '../types/revision-content';

/**
 * Request body for POST /articles/:id/revisions.
 * Content rules match POST /articles: exactly one of `body` or `content`.
 */
export class CreateRevisionDto {
  @ApiPropertyOptional({
    description:
      'Plain markdown convenience. Mutually exclusive with content — converted to one paragraph block.',
    example: '# Updated draft\n\nRewritten intro...',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  body?: string;

  @ApiPropertyOptional({
    description:
      'Ordered content blocks. Mutually exclusive with `body`. ' +
      'For `image` / `video` blocks: upload via POST /media first, then set `mediaId`.',
    type: 'array',
    items: { type: 'object' },
    example: [
      { type: 'heading', level: 1, text: 'My article' },
      { type: 'paragraph', markdown: 'Rewritten body text.' },
    ],
  })
  /** enableImplicitConversion turns block objects into Arrays; re-materialize them. */
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return value;
    return value.map((item: unknown) => {
      if (item === null || typeof item !== 'object') return item;
      return { ...(item as Record<string, unknown>) };
    });
  })
  @IsOptional()
  @IsArray()
  content?: unknown[];

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Cover image media UUID from POST /media. Must be an image.',
  })
  @IsOptional()
  @IsUUID('4')
  coverMediaId?: string;

  @ApiPropertyOptional({
    example: 'Understanding React Hooks',
    description: 'Applied in the same transaction as the new revision.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'understanding-react-hooks',
    description: 'Applied in the same transaction as the new revision.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Replaces the full tag set in the same transaction as the new revision.',
  })
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}

/** Response from POST /articles/:id/revisions */
export type CreatedRevision = {
  id: string;
  articleId: string;
  content: ContentBlock[];
  coverMediaId: string | null;
  createdBy: string;
  createdAt: Date;
  /** 1-based position in the article's revision history (v1, v2, v3…). */
  revisionNumber: number;
  /** Unchanged by this call — creating a revision never publishes it. */
  publishedRevisionId: string | null;
};
