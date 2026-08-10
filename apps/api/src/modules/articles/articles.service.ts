import { BadRequestException, Injectable } from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { ArticlesRepository } from './articles.repository';
import type { CreateArticleDto, CreatedArticle } from './dto/article.dto';
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
