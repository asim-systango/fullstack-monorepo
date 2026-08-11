import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, QueryFailedError, Repository } from 'typeorm';
import { Media } from '../media/media.entity';
import { RevisionMedia } from '../media/revision-media.entity';
import { ArticleTag } from '../tags/article-tag.entity';
import { Tag } from '../tags/tag.entity';
import { Article } from './article.entity';
import { Revision } from './revision.entity';
import { collectMediaRefs, type ContentBlock } from './types/revision-content';
import type { ArticleListItem, StudioArticleDetail } from './dto/get-article.dto';
import type {
  PublicArticleDetail,
  PublicArticleListItem,
} from './dto/public-article.dto';

export type CreateDraftInput = {
  authorId: string;
  title: string;
  slug: string;
  content: ContentBlock[];
  tagIds?: string[];
};

export type ListArticlesInput = {
  /** When set, restricts results to this author only (Author role). */
  authorId?: string;
  page: number;
  limit: number;
};

export type GetStudioArticleInput = {
  id: string;
  /** When set, ownership is enforced: only the matching author's article is returned. */
  authorId?: string;
};

export type ListPublicArticlesInput = {
  page: number;
  limit: number;
};

export type GetPublicArticleBySlugInput = {
  slug: string;
};

@Injectable()
export class ArticlesRepository {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(Revision)
    private readonly revisionRepo: Repository<Revision>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(ArticleTag)
    private readonly articleTagRepo: Repository<ArticleTag>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(RevisionMedia)
    private readonly revisionMediaRepo: Repository<RevisionMedia>,
  ) {}

  async createDraft(input: CreateDraftInput) {
    const tagIds = [...new Set(input.tagIds ?? [])];
    const mediaRefs = collectMediaRefs(input.content);

    // 1. Validate tags
    let selectedTags: Tag[] = [];
    if (tagIds.length > 0) {
      selectedTags = await this.tagRepo.find({
        where: { id: In(tagIds) },
      });

      if (selectedTags.length !== tagIds.length) {
        const found = new Set(selectedTags.map((tag) => tag.id));
        throw new BadRequestException({
          message: 'One or more tag IDs are invalid',
          details: { tagIds: tagIds.filter((id) => !found.has(id)) },
        });
      }
    }

    // 2. Validate inline media references
    if (mediaRefs.length > 0) {
      const mediaIds = [...new Set(mediaRefs.map((ref) => ref.mediaId))];
      const mediaRows = await this.mediaRepo.find({
        where: { id: In(mediaIds) },
      });
      const byId = new Map(mediaRows.map((row) => [row.id, row]));

      const missing = mediaIds.filter((id) => !byId.has(id));
      if (missing.length > 0) {
        throw new BadRequestException({
          message: 'One or more media IDs are invalid',
          details: { mediaIds: missing },
        });
      }

      const typeMismatches = mediaRefs.filter((ref) => {
        const row = byId.get(ref.mediaId);
        return row !== undefined && row.resourceType !== ref.expectedResourceType;
      });
      if (typeMismatches.length > 0) {
        throw new BadRequestException({
          message: 'Media resource_type does not match block type',
          details: {
            mismatches: typeMismatches.map((ref) => ({
              blockId: ref.blockId,
              mediaId: ref.mediaId,
              expected: ref.expectedResourceType,
              actual: byId.get(ref.mediaId)?.resourceType,
            })),
          },
        });
      }
    }

    let articleId: string | undefined;

    try {
      // 3. Create draft article
      const article = await this.articleRepo.save({
        authorId: input.authorId,
        title: input.title,
        slug: input.slug,
        publishedRevisionId: null,
        publishedAt: null,
      });
      articleId = article.id;

      // 4. Create first revision
      const revision = await this.revisionRepo.save({
        articleId: article.id,
        content: input.content,
        createdBy: input.authorId,
        coverMediaId: null,
      });

      // 5. Derived revision_media index for inline image/video blocks
      if (mediaRefs.length > 0) {
        await this.revisionMediaRepo.save(
          mediaRefs.map((ref) => ({
            revisionId: revision.id,
            mediaId: ref.mediaId,
            blockId: ref.blockId,
            role: 'inline' as const,
          })),
        );
      }

      // 6. Attach tags
      if (selectedTags.length > 0) {
        await this.articleTagRepo.save(
          selectedTags.map((tag) => ({
            articleId: article.id,
            tagId: tag.id,
          })),
        );
      }

      return {
        article,
        revision,
        tags: selectedTags.map((tag) => ({ id: tag.id, name: tag.name })),
      };
    } catch (err) {
      // Undo partial inserts if a later step failed
      if (articleId) {
        await this.articleTagRepo.delete({ articleId });
        await this.revisionRepo.delete({ articleId });
        await this.articleRepo.delete(articleId);
      }

      if (
        err instanceof QueryFailedError &&
        (err.driverError as { code?: string; constraint?: string })?.code === '23505' &&
        (err.driverError as { constraint?: string })?.constraint === 'UQ_articles_slug'
      ) {
        throw new ConflictException('An article with this slug already exists');
      }

      throw err;
    }
  }

  async listArticles(
    input: ListArticlesInput,
  ): Promise<{ items: ArticleListItem[]; total: number }> {
    const where = {
      deletedAt: IsNull(),
      ...(input.authorId ? { authorId: input.authorId } : {}),
    };

    const [rows, total] = await this.articleRepo.findAndCount({
      where,
      select: {
        id: true,
        authorId: true,
        title: true,
        slug: true,
        publishedRevisionId: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { updatedAt: 'DESC' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    });

    return { items: rows as ArticleListItem[], total };
  }

  async findStudioArticleById(
    input: GetStudioArticleInput,
  ): Promise<StudioArticleDetail | null> {
    const article = await this.articleRepo.findOne({
      where: {
        id: input.id,
        deletedAt: IsNull(),
        ...(input.authorId ? { authorId: input.authorId } : {}),
      },
      relations: {
        articleTags: { tag: true },
        revisions: true,
      },
      order: {
        revisions: { createdAt: 'ASC' },
      },
    });

    if (!article) return null;

    return {
      id: article.id,
      authorId: article.authorId,
      title: article.title,
      slug: article.slug,
      publishedRevisionId: article.publishedRevisionId,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      tags: article.articleTags.map((at) => ({ id: at.tag.id, name: at.tag.name })),
      revisions: article.revisions.map((r) => ({
        id: r.id,
        createdBy: r.createdBy,
        coverMediaId: r.coverMediaId,
        content: r.content,
        createdAt: r.createdAt,
      })),
    };
  }

  async listPublicArticles(
    input: ListPublicArticlesInput,
  ): Promise<{ items: PublicArticleListItem[]; total: number }> {
    const [rows, total] = await this.articleRepo.findAndCount({
      where: {
        deletedAt: IsNull(),
        publishedRevisionId: Not(IsNull()),
      },
      relations: {
        articleTags: { tag: true },
        publishedRevision: { coverMedia: true },
      },
      order: { publishedAt: 'DESC' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    });

    return {
      items: rows.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        publishedAt: article.publishedAt!,
        publishedRevisionId: article.publishedRevisionId!,
        tags: article.articleTags.map((at) => ({ id: at.tag.id, name: at.tag.name })),
        coverMedia: article.publishedRevision?.coverMedia
          ? {
              id: article.publishedRevision.coverMedia.id,
              secureUrl: article.publishedRevision.coverMedia.secureUrl,
              resourceType: article.publishedRevision.coverMedia.resourceType,
              defaultAltText: article.publishedRevision.coverMedia.defaultAltText,
            }
          : null,
      })),
      total,
    };
  }

  async findPublicArticleBySlug(
    input: GetPublicArticleBySlugInput,
  ): Promise<PublicArticleDetail | null> {
    const article = await this.articleRepo.findOne({
      where: {
        slug: input.slug,
        deletedAt: IsNull(),
        publishedRevisionId: Not(IsNull()),
      },
      relations: {
        articleTags: { tag: true },
        publishedRevision: { coverMedia: true },
      },
    });

    if (!article?.publishedRevision) return null;

    const published = article.publishedRevision;

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      publishedAt: article.publishedAt!,
      tags: article.articleTags.map((at) => ({ id: at.tag.id, name: at.tag.name })),
      revision: {
        id: published.id,
        content: published.content,
        coverMedia: published.coverMedia
          ? {
              id: published.coverMedia.id,
              secureUrl: published.coverMedia.secureUrl,
              resourceType: published.coverMedia.resourceType,
              defaultAltText: published.coverMedia.defaultAltText,
            }
          : null,
      },
    };
  }
}
