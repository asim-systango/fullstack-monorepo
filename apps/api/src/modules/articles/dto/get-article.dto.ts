import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { ArticleMedia } from './article-media.dto';

/** Route params for GET /articles/studio/:id */
export class ArticleIdParam {
  @IsUUID('4')
  id!: string;
}

/**
 * Workflow positions the list can be narrowed to. Derived from the revision
 * pointers, not from a status column — see `ArticleListItem`.
 */
export const ARTICLE_STATUS_FILTERS = [
  'draft',
  'review',
  'published',
  'deleted',
] as const;

export type ArticleStatusFilter = (typeof ARTICLE_STATUS_FILTERS)[number];

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

  @ApiPropertyOptional({
    enum: ARTICLE_STATUS_FILTERS,
    description:
      '`draft` — never submitted and never published. ' +
      '`review` — a submitted revision that is not live yet (unpublished, or newer than the live one). ' +
      '`published` — `publishedRevisionId` is set. ' +
      '`deleted` — soft-deleted rows only (implies includeDeleted). ' +
      '`review` and `published` overlap only when a live article has a *newer* revision under review.',
  })
  @IsOptional()
  @IsIn(ARTICLE_STATUS_FILTERS)
  status?: ArticleStatusFilter;

  @ApiPropertyOptional({ description: 'Case-insensitive partial title match' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag name (case-insensitive, exact match)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  tag?: string;

  @ApiPropertyOptional({ description: 'Restrict to a single gateway author UUID' })
  @IsOptional()
  @IsUUID('4')
  authorId?: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'Include soft-deleted articles so a moderation or trash view can show them. ' +
      'Ownership scoping still applies, so an Author only ever sees their own.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeDeleted: boolean = false;
}

/**
 * Dataset-wide article counts for dashboards, so a paginated list never has to
 * be summed client-side. `total` and the breakdown exclude soft-deleted rows;
 * `deleted` counts them separately.
 */
export type ArticleStatsResponse = {
  total: number;
  published: number;
  drafts: number;
  pendingReview: number;
  deleted: number;
};

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
  /** Set only when the list was requested with `includeDeleted`. */
  deletedAt: Date | null;
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
  /** Future publish pointer. Does not make the article public by itself. */
  scheduledRevisionId: string | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ id: string; name: string }>;
  revisions: StudioRevisionSummary[];
};
