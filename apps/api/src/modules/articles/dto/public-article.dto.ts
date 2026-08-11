import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  Max,
} from 'class-validator';

/** Route params for GET /articles/public/:slug */
export class ArticleSlugParam {
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
}

/** Query params for GET /articles/public */
export class ListPublicArticlesQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/** Cover media on a public article list item */
export type PublicArticleCoverMedia = {
  id: string;
  secureUrl: string;
  resourceType: string;
  defaultAltText: string | null;
};

/** One item in GET /articles/public */
export type PublicArticleListItem = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date;
  publishedRevisionId: string;
  tags: Array<{ id: string; name: string }>;
  coverMedia: PublicArticleCoverMedia | null;
};

/** Paginated response for GET /articles/public */
export type PublicArticleListResponse = {
  data: PublicArticleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Published revision on GET /articles/public/:slug */
export type PublicArticleRevision = {
  id: string;
  content: unknown[];
  coverMedia: PublicArticleCoverMedia | null;
};

/** Response from GET /articles/public/:slug */
export type PublicArticleDetail = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date;
  tags: Array<{ id: string; name: string }>;
  revision: PublicArticleRevision;
};
