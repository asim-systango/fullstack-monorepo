import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Allowed `sort` values: field name, optional `-` prefix for descending. */
export const BOOK_SORT_FIELDS = [
  'title',
  'author',
  'publishedYear',
  'createdAt',
  '-title',
  '-author',
  '-publishedYear',
  '-createdAt',
] as const;

export type BookSortField = (typeof BOOK_SORT_FIELDS)[number];

export class ListBooksQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search title or ISBN (case-insensitive partial match)',
    example: 'Clean Code',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by author (case-insensitive partial match)',
    example: 'Martin',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'ISBN (case-insensitive partial match; hyphens ignored)',
    example: '9780132350884',
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({
    description: 'When true, only books with at least one available (non-deleted) copy',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Sort field; prefix with `-` for descending',
    enum: BOOK_SORT_FIELDS,
    default: 'title',
  })
  @IsOptional()
  @IsIn(BOOK_SORT_FIELDS)
  sort?: BookSortField = 'title';
}
