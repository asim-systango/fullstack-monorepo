import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

/** Route params for GET /articles/studio/:id */
export class ArticleIdParam {
  @IsUUID('4')
  id!: string;
}

/** Query params for GET /articles/studio */
export class ListArticlesQuery {
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

/** One item in the GET /articles/studio list response */
export type ArticleListItem = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Paginated response for GET /articles/studio */
export type ArticleListResponse = {
  data: ArticleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** One revision summary for GET /articles/studio/:id */
export type StudioRevisionSummary = {
  id: string;
  createdBy: string;
  coverMediaId: string | null;
  content: unknown[];
  createdAt: Date;
};

/** Response from GET /articles/studio/:id */
export type StudioArticleDetail = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ id: string; name: string }>;
  revisions: StudioRevisionSummary[];
};
