import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Route params for article-scoped comment routes */
export class CommentArticleIdParam {
  @IsUUID('4')
  articleId!: string;
}

/** Route params for GET/PATCH/DELETE /comments/:id */
export class CommentIdParam {
  @IsUUID('4')
  id!: string;
}

/** Query params for GET /articles/:articleId/comments */
export class ListCommentsQuery {
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

/** Comment fields returned by comment endpoints */
export type CommentResponse = {
  id: string;
  articleId: string;
  userId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Paginated response for GET /articles/:articleId/comments */
export type CommentListResponse = {
  data: CommentResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Query params for GET /comments — the moderation queue */
export class ListAllCommentsQuery {
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

  @ApiPropertyOptional({ description: 'Restrict to one article' })
  @IsOptional()
  @IsUUID('4')
  articleId?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive partial match on the body' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}

/**
 * A comment plus enough article context to moderate it without a second lookup.
 * Unlike the public routes this deliberately includes comments on draft and
 * soft-deleted articles — abusive content has to be removable either way.
 */
export type ModerationCommentListItem = CommentResponse & {
  article: {
    id: string;
    title: string;
    slug: string;
    /** Null means the article is a draft, so this comment is not publicly reachable. */
    publishedRevisionId: string | null;
    deletedAt: Date | null;
  };
};

/** Paginated response for GET /comments */
export type ModerationCommentListResponse = {
  data: ModerationCommentListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Dataset-wide comment count for dashboards */
export type CommentStatsResponse = {
  /**
   * Comments that have not been soft-deleted, whatever state their article is
   * in — the same population as `GET /comments`, so the two always agree.
   */
  total: number;
};

/** Response from DELETE /comments/:id */
export type DeleteCommentResponse = {
  message: string;
};
