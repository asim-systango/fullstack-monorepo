import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesRepository } from './articles.repository';
import type { CreateArticleDto, CreatedArticle } from './dto/article.dto';
import type {
  ArticleListResponse,
  ListArticlesQuery,
  StudioArticleDetail,
} from './dto/get-article.dto';
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
        content: created.revision.content,
        createdAt: created.revision.createdAt,
      },
      tags: created.tags,
    };
  }

  async listArticles(
    query: ListArticlesQuery,
    user: JwtUser,
  ): Promise<ArticleListResponse> {
    const isAuthor = user.role === Role.Author;

    const { items, total } = await this.articlesRepository.listArticles({
      authorId: isAuthor ? user.id : undefined,
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

  async listStudioArticles(
    query: ListArticlesQuery,
    user: JwtUser,
  ): Promise<ArticleListResponse> {
    return this.listArticles(query, user);
  }

  async getStudioArticle(id: string, user: JwtUser): Promise<StudioArticleDetail> {
    const isAuthor = user.role === Role.Author;

    const article = await this.articlesRepository.findStudioArticleById({
      id,
      authorId: isAuthor ? user.id : undefined,
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  private resolveContent(dto: CreateArticleDto): ContentBlock[] {
    const hasBody = typeof dto.body === 'string' && dto.body.length > 0;
    const hasContent = Array.isArray(dto.content) && dto.content.length > 0;

    if (hasBody && hasContent) {
      throw new BadRequestException(
        'Provide exactly one of body (markdown) or content (block array)',
      );
    }

    if (hasContent) {
      return parseContentBlocks(dto.content);
    }

    if (hasBody) {
      return markdownToContentBlocks(dto.body!);
    }

    throw new BadRequestException(
      'Provide exactly one of body (markdown) or content (block array)',
    );
  }
}
