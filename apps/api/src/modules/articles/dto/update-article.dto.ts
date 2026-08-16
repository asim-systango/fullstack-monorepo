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
  ValidateIf,
} from 'class-validator';

function emptyToNull({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Request body for PATCH /articles/:id.
 * Every field is optional, but at least one must be present.
 * Content is never edited here — that creates a revision instead.
 */
export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Understanding React Hooks' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'understanding-react-hooks' })
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
    description: 'Replaces the full tag set for this article.',
  })
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    nullable: true,
    description: 'Public <title> override. Empty string clears it.',
    maxLength: 200,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(200)
  metaTitle?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Public meta description / Open Graph description. Empty string clears it.',
    maxLength: 500,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Open Graph image URL. Empty string clears it.',
    maxLength: 2000,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2000)
  ogImage?: string | null;
}

/** Response from DELETE /articles/:id */
export type DeletedArticle = {
  id: string;
  deletedAt: Date;
};
