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
}

/** Response from DELETE /articles/:id */
export type DeletedArticle = {
  id: string;
  deletedAt: Date;
};
