import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Comment } from './comment.entity';
import type { CommentResponse } from './dto/get-comment.dto';

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
    const row = await this.commentRepo
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.article', 'article')
      .where('comment.id = :id', { id })
      .andWhere('comment.deleted_at IS NULL')
      .getOne();

    if (!row) return null;

    return {
      comment: this.toCommentResponse(row),
      articlePublished: row.article.publishedRevisionId != null,
      articleDeleted: row.article.deletedAt != null,
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
