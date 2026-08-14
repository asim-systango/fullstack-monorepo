import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import type { ArticleMedia } from './article-media.dto';

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
  /** Review workflow — set by the Author, never implies publication. */
  submittedRevisionId: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** Total revisions in history, so the UI can label the latest as v1, v2, v3… */
  revisionCount: number;
  /** 1-based position of the submitted revision, so queues can show "v3". */
  submittedRevisionNumber: number | null;
  publishedRevisionNumber: number | null;
  /**
   * Newest revision. Compare with `publishedRevisionId` to tell an untouched
   * published article apart from one that has been revised since publishing.
   */
  latestRevisionId: string | null;
  tags: Array<{ id: string; name: string }>;
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
  /** Lookup for the `mediaId` on inline blocks, so drafts can be previewed. */
  media: ArticleMedia[];
};

/** Response from GET /articles/studio/:id */
export type StudioArticleDetail = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: Date | null;
  submittedRevisionId: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ id: string; name: string }>;
  revisions: StudioRevisionSummary[];
};
