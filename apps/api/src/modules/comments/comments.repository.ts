import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Comment } from './comment.entity';
import type { CommentResponse, ModerationCommentListItem } from './dto/get-comment.dto';

export type CreateCommentInput = {
  articleId: string;
  userId: string;
  body: string;
};

export type ListCommentsInput = {
  articleId: string;
  page: number;
  limit: number;
};

export type UpdateCommentInput = {
  id: string;
  body: string;
};

export type ListAllCommentsInput = {
  page: number;
  limit: number;
  articleId?: string;
  /** Case-insensitive partial match on the comment body. */
  search?: string;
};

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  /**
   * True when the article exists, is not soft-deleted, and is published
   * (`publishedRevisionId IS NOT NULL`).
   */
  async isPublishedArticle(articleId: string): Promise<boolean> {
    const count = await this.articleRepo.count({
      where: {
        id: articleId,
        deletedAt: IsNull(),
        publishedRevisionId: Not(IsNull()),
      },
    });
    return count > 0;
  }

  async createComment(input: CreateCommentInput): Promise<CommentResponse> {
    const comment = await this.commentRepo.save({
      articleId: input.articleId,
      userId: input.userId,
      body: input.body,
    });
    return this.toCommentResponse(comment);
  }

  async listCommentsForPublishedArticle(
    input: ListCommentsInput,
  ): Promise<{ items: CommentResponse[]; total: number }> {
    const [rows, total] = await this.commentRepo.findAndCount({
      where: { articleId: input.articleId },
      select: {
        id: true,
        articleId: true,
        userId: true,
        body: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { createdAt: 'ASC' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    });

    return {
      items: rows.map((row) => this.toCommentResponse(row)),
      total,
    };
  }

  /**
   * The moderation queue: every non-deleted comment on the platform, newest first,
   * with its article attached. Comments on drafts and soft-deleted articles are
   * included on purpose — a moderator must be able to remove those too.
   */
  async listAllComments(
    input: ListAllCommentsInput,
  ): Promise<{ items: ModerationCommentListItem[]; total: number }> {
    // Comments are selected on their own and the articles fetched in a second
    // query. Joining the relation would not work: TypeORM appends its own
    // `article.deleted_at IS NULL` to a relation join, and `withDeleted()` only
    // lifts that for the root entity — which would drop exactly the comments on
    // removed articles that a moderator most needs to see.
    const qb = this.commentRepo
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.articleId',
        'comment.userId',
        'comment.body',
        'comment.createdAt',
        'comment.updatedAt',
      ]);

    if (input.articleId) {
      qb.andWhere('comment.article_id = :articleId', { articleId: input.articleId });
    }

    if (input.search) {
      qb.andWhere('comment.body ILIKE :search', { search: `%${input.search}%` });
    }

    const [rows, total] = await qb
      .orderBy('comment.createdAt', 'DESC')
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getManyAndCount();

    const articles = await this.findArticleContext(rows.map((row) => row.articleId));

    return {
      items: rows.flatMap((row) => {
        const article = articles.get(row.articleId);
        // The FK is NOT NULL with ON DELETE CASCADE, so a miss cannot happen in
        // practice; skipping beats inventing placeholder article details.
        if (!article) return [];
        return [{ ...this.toCommentResponse(row), article }];
      }),
      total,
    };
  }

  /**
   * Articles behind a set of comments, including soft-deleted ones. Uses
   * `withDeleted` on the root entity, which does work — unlike on a join.
   */
  private async findArticleContext(
    articleIds: string[],
  ): Promise<Map<string, ModerationCommentListItem['article']>> {
    if (articleIds.length === 0) return new Map();

    const articles = await this.articleRepo.find({
      where: { id: In([...new Set(articleIds)]) },
      withDeleted: true,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedRevisionId: true,
        deletedAt: true,
      },
    });

    return new Map(
      articles.map((article) => [
        article.id,
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          publishedRevisionId: article.publishedRevisionId,
          deletedAt: article.deletedAt,
        },
      ]),
    );
  }

  /**
   * Every comment that has not been deleted, whatever state its article is in.
   * Deliberately the same population as the moderation queue, so the dashboard
   * count and that list can never disagree.
   */
  async countComments(): Promise<number> {
    return this.commentRepo.count();
  }

  /**
   * Returns the comment only when its article is published and not soft-deleted.
   * Soft-deleted comments are excluded by TypeORM's DeleteDateColumn.
   */
  async findPublicCommentById(id: string): Promise<CommentResponse | null> {
    const comment = await this.commentRepo
      .createQueryBuilder('comment')
      .innerJoin('comment.article', 'article')
      .where('comment.id = :id', { id })
      .andWhere('comment.deleted_at IS NULL')
      .andWhere('article.deleted_at IS NULL')
      .andWhere('article.published_revision_id IS NOT NULL')
      .select([
        'comment.id',
        'comment.articleId',
        'comment.userId',
        'comment.body',
        'comment.createdAt',
        'comment.updatedAt',
      ])
      .getOne();

    return comment ? this.toCommentResponse(comment) : null;
  }

  /**
   * Loads a non-deleted comment with article publication fields for auth/mutation checks.
   */
  async findCommentForMutation(id: string): Promise<{
    comment: CommentResponse;
    articlePublished: boolean;
    articleDeleted: boolean;
  } | null> {
    // Soft-deleted comments are excluded by TypeORM's DeleteDateColumn.
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) return null;

    // Loaded separately, and with deleted rows included, so a moderator can
    // still act on a comment whose article has been removed. The caller decides
    // what that means: owners get 404, editors and admins may moderate.
    const article = await this.articleRepo.findOne({
      where: { id: comment.articleId },
      withDeleted: true,
      select: { id: true, publishedRevisionId: true, deletedAt: true },
    });
    if (!article) return null;

    return {
      comment: this.toCommentResponse(comment),
      articlePublished: article.publishedRevisionId != null,
      articleDeleted: article.deletedAt != null,
    };
  }

  async updateComment(input: UpdateCommentInput): Promise<CommentResponse | null> {
    const existing = await this.commentRepo.findOne({ where: { id: input.id } });
    if (!existing) return null;

    existing.body = input.body;
    const saved = await this.commentRepo.save(existing);
    return this.toCommentResponse(saved);
  }

  /**
   * Soft-deletes the comment. Does not touch Article, Revision, Tag, or ArticleTag.
   * Returns false when the comment does not exist (or is already soft-deleted).
   */
  async softDeleteComment(id: string): Promise<boolean> {
    const result = await this.commentRepo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  private toCommentResponse(comment: Comment): CommentResponse {
    return {
      id: comment.id,
      articleId: comment.articleId,
      userId: comment.userId,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
