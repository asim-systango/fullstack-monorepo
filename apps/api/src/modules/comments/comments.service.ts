import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { CommentsRepository } from './comments.repository';
import type { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import type {
  CommentListResponse,
  CommentResponse,
  CommentStatsResponse,
  DeleteCommentResponse,
  ListAllCommentsQuery,
  ListCommentsQuery,
  ModerationCommentListResponse,
} from './dto/get-comment.dto';

const COMMENT_NOT_FOUND = 'Comment not found';
const ARTICLE_NOT_FOUND = 'Article not found';
const COMMENT_DELETED = 'Comment deleted';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async createComment(
    articleId: string,
    dto: CreateCommentDto,
    user: JwtUser,
  ): Promise<CommentResponse> {
    await this.ensurePublishedArticle(articleId);

    return this.commentsRepository.createComment({
      articleId,
      userId: user.id,
      body: dto.body,
    });
  }

  async listComments(
    articleId: string,
    query: ListCommentsQuery,
  ): Promise<CommentListResponse> {
    await this.ensurePublishedArticle(articleId);

    const { items, total } =
      await this.commentsRepository.listCommentsForPublishedArticle({
        articleId,
        page: query.page,
        limit: query.limit,
      });

    return {
      data: items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  /**
   * Moderation queue for editors and admins. Not scoped to published articles —
   * the whole point is to reach abusive content wherever it sits.
   */
  async listAllComments(
    query: ListAllCommentsQuery,
  ): Promise<ModerationCommentListResponse> {
    const { items, total } = await this.commentsRepository.listAllComments({
      page: query.page,
      limit: query.limit,
      articleId: query.articleId,
      search: query.q,
    });

    return {
      data: items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getCommentStats(): Promise<CommentStatsResponse> {
    return { total: await this.commentsRepository.countComments() };
  }

  async getCommentById(id: string): Promise<CommentResponse> {
    const comment = await this.commentsRepository.findPublicCommentById(id);
    if (!comment) {
      throw new NotFoundException(COMMENT_NOT_FOUND);
    }
    return comment;
  }

  async updateComment(
    id: string,
    dto: UpdateCommentDto,
    user: JwtUser,
  ): Promise<CommentResponse> {
    const resolved = await this.resolveMutableComment(id, user);
    this.assertCanModerateOrOwn(resolved.comment.userId, user);

    const updated = await this.commentsRepository.updateComment({
      id,
      body: dto.body,
    });
    if (!updated) {
      throw new NotFoundException(COMMENT_NOT_FOUND);
    }
    return updated;
  }

  async deleteComment(id: string, user: JwtUser): Promise<DeleteCommentResponse> {
    const resolved = await this.resolveMutableComment(id, user);
    this.assertCanModerateOrOwn(resolved.comment.userId, user);

    const deleted = await this.commentsRepository.softDeleteComment(id);
    if (!deleted) {
      throw new NotFoundException(COMMENT_NOT_FOUND);
    }

    return { message: COMMENT_DELETED };
  }

  private async ensurePublishedArticle(articleId: string): Promise<void> {
    const published = await this.commentsRepository.isPublishedArticle(articleId);
    if (!published) {
      throw new NotFoundException(ARTICLE_NOT_FOUND);
    }
  }

  private async resolveMutableComment(
    id: string,
    user: JwtUser,
  ): Promise<{
    comment: CommentResponse;
  }> {
    const resolved = await this.commentsRepository.findCommentForMutation(id);
    if (!resolved) {
      throw new NotFoundException(COMMENT_NOT_FOUND);
    }

    // Public comment API must not expose or mutate comments on unavailable articles.
    // Moderators are exempt: an abusive comment still has to be removable after its
    // article has been unpublished or soft-deleted.
    const unavailable = resolved.articleDeleted || !resolved.articlePublished;
    if (unavailable && !this.canModerate(user)) {
      throw new NotFoundException(COMMENT_NOT_FOUND);
    }

    return { comment: resolved.comment };
  }

  private canModerate(user: JwtUser): boolean {
    return user.role === Role.Editor || user.role === Role.Admin;
  }

  /** Owners may mutate; editors/admins may moderate any comment. */
  private assertCanModerateOrOwn(ownerUserId: string, user: JwtUser): void {
    if (ownerUserId === user.id) return;
    if (this.canModerate(user)) return;
    throw new ForbiddenException('You can only modify your own comments');
  }
}
