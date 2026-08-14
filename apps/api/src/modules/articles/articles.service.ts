import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesRepository } from './articles.repository';
import type { CreateArticleDto, CreatedArticle } from './dto/article.dto';
import type {
  ArticleListResponse,
  ArticleStatsResponse,
  ListArticlesQuery,
  StudioArticleDetail,
} from './dto/get-article.dto';
import type { PublishArticleDto, PublishedArticle } from './dto/publish-article.dto';
import type {
  ListPublicArticlesQuery,
  PublicArticleDetail,
  PublicArticleListResponse,
} from './dto/public-article.dto';
import type { CreatedRevision, CreateRevisionDto } from './dto/revision.dto';
import type { SubmittedArticle } from './dto/submit-review.dto';
import type { DeletedArticle, UpdateArticleDto } from './dto/update-article.dto';
import {
  markdownToContentBlocks,
  parseContentBlocks,
  type ContentBlock,
} from './types/revision-content';

@Injectable()
export class ArticlesService {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async createArticle(dto: CreateArticleDto, user: JwtUser): Promise<CreatedArticle> {
    const content = this.resolveContent(dto);

    const created = await this.articlesRepository.createDraft({
      authorId: user.id,
      title: dto.title,
      slug: dto.slug,
      content,
      tagIds: dto.tagIds,
      coverMediaId: dto.coverMediaId,
    });

    return {
      id: created.article.id,
      authorId: created.article.authorId,
      title: created.article.title,
      slug: created.article.slug,
      publishedRevisionId: null,
      publishedAt: null,
      createdAt: created.article.createdAt,
      updatedAt: created.article.updatedAt,
      revision: {
        id: created.revision.id,
        content: created.revision.content as ContentBlock[],
        createdAt: created.revision.createdAt,
      },
      tags: created.tags,
    };
  }

  /**
   * Appends a revision. The published pointer is never moved here — an editor
   * has to call publishArticle for the new content to become public.
   */
  async createRevision(
    articleId: string,
    dto: CreateRevisionDto,
    user: JwtUser,
  ): Promise<CreatedRevision> {
    const content = this.resolveContent(dto);

    const created = await this.articlesRepository.createRevision({
      articleId,
      content,
      createdBy: user.id,
      coverMediaId: dto.coverMediaId,
      authorId: this.ownershipScope(user),
    });

    return {
      id: created.revision.id,
      articleId,
      content: created.revision.content as ContentBlock[],
      coverMediaId: created.revision.coverMediaId,
      createdBy: created.revision.createdBy,
      createdAt: created.revision.createdAt,
      revisionNumber: created.revisionNumber,
      publishedRevisionId: created.publishedRevisionId,
    };
  }

  async updateArticle(
    articleId: string,
    dto: UpdateArticleDto,
    user: JwtUser,
  ): Promise<StudioArticleDetail> {
    if (
      dto.title === undefined &&
      dto.slug === undefined &&
      dto.tagIds === undefined &&
      dto.metaTitle === undefined &&
      dto.metaDescription === undefined &&
      dto.ogImage === undefined
    ) {
      throw new BadRequestException(
        'Provide at least one of title, slug, tagIds, metaTitle, metaDescription, or ogImage',
      );
    }

    await this.articlesRepository.updateArticle({
      id: articleId,
      title: dto.title,
      slug: dto.slug,
      tagIds: dto.tagIds,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      ogImage: dto.ogImage,
      authorId: this.ownershipScope(user),
    });

    return this.getStudioArticle(articleId, user);
  }

  async deleteArticle(articleId: string, user: JwtUser): Promise<DeletedArticle> {
    return this.articlesRepository.softDeleteArticle({
      id: articleId,
      authorId: this.ownershipScope(user),
    });
  }

  /**
   * Author action. Records which revision an Editor should look at.
   * Deliberately has no effect on publication.
   */
  async submitForReview(articleId: string, user: JwtUser): Promise<SubmittedArticle> {
    return this.articlesRepository.submitForReview({
      articleId,
      authorId: this.ownershipScope(user),
    });
  }

  async publishArticle(
    articleId: string,
    dto: PublishArticleDto,
    user: JwtUser,
  ): Promise<PublishedArticle> {
    const authorId = await this.articlesRepository.findLiveAuthorId(articleId);
    if (!authorId) {
      throw new NotFoundException('Article not found');
    }

    // Four-eyes: an Editor may not make their own article public.
    // Admins can still publish anyone's work.
    if (user.role === Role.Editor && user.id === authorId) {
      throw new ForbiddenException(
        'You cannot publish an article you authored. Another editor must publish it.',
      );
    }

    return this.articlesRepository.publishRevision({
      articleId,
      revisionId: dto.revisionId,
    });
  }

  async listArticles(
    query: ListArticlesQuery,
    user: JwtUser,
  ): Promise<ArticleListResponse> {
    // An Author is pinned to their own id; the optional authorId filter is only
    // a narrowing tool for Editors and Admins looking at the whole platform.
    const ownership = this.ownershipScope(user);

    const { items, total } = await this.articlesRepository.listArticles({
      authorId: ownership ?? query.authorId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.q,
      tag: query.tag,
      includeDeleted: query.includeDeleted || query.status === 'deleted',
    });

    return {
      data: items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  /** Authors receive their own counts; editors and admins receive the platform. */
  async getArticleStats(user: JwtUser): Promise<ArticleStatsResponse> {
    return this.articlesRepository.countArticlesByState(this.ownershipScope(user));
  }

  async listStudioArticles(
    query: ListArticlesQuery,
    user: JwtUser,
  ): Promise<ArticleListResponse> {
    return this.listArticles(query, user);
  }

  async getStudioArticle(id: string, user: JwtUser): Promise<StudioArticleDetail> {
    const article = await this.articlesRepository.findStudioArticleById({
      id,
      authorId: this.ownershipScope(user),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async listPublicArticles(
    query: ListPublicArticlesQuery,
  ): Promise<PublicArticleListResponse> {
    const { items, total } = await this.articlesRepository.listPublicArticles({
      page: query.page,
      limit: query.limit,
      search: query.q,
      tag: query.tag,
    });

    return {
      data: items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getPublicArticleBySlug(slug: string): Promise<PublicArticleDetail> {
    const article = await this.articlesRepository.findPublicArticleBySlug({ slug });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  /** Authors are scoped to their own articles; editors and admins are not. */
  private ownershipScope(user: JwtUser): string | undefined {
    return user.role === Role.Author ? user.id : undefined;
  }

  private resolveContent(dto: { body?: string; content?: unknown[] }): ContentBlock[] {
    const hasBody = Boolean(dto.body);
    const hasContent = Array.isArray(dto.content) && dto.content.length > 0;

    if (hasBody === hasContent) {
      throw new BadRequestException(
        'Provide exactly one of body (markdown) or content (block array)',
      );
    }

    return hasContent
      ? parseContentBlocks(dto.content)
      : markdownToContentBlocks(dto.body!);
  }
}
