import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

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

/** Response from DELETE /comments/:id */
export type DeleteCommentResponse = {
  message: string;
};
