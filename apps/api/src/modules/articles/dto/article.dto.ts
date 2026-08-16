import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

/** Request body for POST /articles */
export class CreateArticleDto {
  @ApiProperty({ example: 'Understanding React Hooks' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'understanding-react-hooks' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({
    description:
      'Plain markdown convenience. Mutually exclusive with content — converted to one paragraph block.',
    example: '# React Hooks\n\nReact Hooks allow...',
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
      'For `image` / `video` blocks: first upload via POST /media, then set `mediaId` to the returned `id` (UUID). ' +
      'Do not put file binaries or Cloudinary URLs here.',
    type: 'array',
    items: { type: 'object' },
    example: [
      {
        type: 'heading',
        level: 1,
        text: 'My article',
      },
      {
        type: 'paragraph',
        markdown: 'Intro text here.',
      },
      {
        type: 'image',
        mediaId: 'PASTE_MEDIA_UUID_FROM_POST_MEDIA',
        alt: 'Screenshot',
        caption: 'Optional caption',
      },
    ],
  })
  /**
   * Global ValidationPipe uses enableImplicitConversion, which would turn
   * each block object into an Array instance. Re-materialize plain objects.
   */
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

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Cover image media UUID from POST /media. Must be an image. Shown on public list/detail as coverMedia.',
  })
  @IsOptional()
  @IsUUID('4')
  coverMediaId?: string;
}

/** Response from POST /articles */
export type CreatedArticle = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: null;
  publishedAt: null;
  createdAt: Date;
  updatedAt: Date;
  revision: {
    id: string;
    /** Stored content blocks — image/video blocks keep `mediaId` only. */
    content: ContentBlock[];
    createdAt: Date;
  };
  tags: Array<{ id: string; name: string }>;
};
