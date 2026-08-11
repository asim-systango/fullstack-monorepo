import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

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
