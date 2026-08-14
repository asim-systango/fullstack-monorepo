import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, QueryFailedError, Repository } from 'typeorm';
import { Media } from '../media/media.entity';
import { RevisionMedia } from '../media/revision-media.entity';
import { ArticleTag } from '../tags/article-tag.entity';
import { Tag } from '../tags/tag.entity';
import { Article } from './article.entity';
import { Revision } from './revision.entity';
import {
  collectMediaRefs,
  parseContentBlocks,
  type ContentBlock,
  type MediaRef,
} from './types/revision-content';
import type {
  ArticleListItem,
  ArticleStatsResponse,
  ArticleStatusFilter,
  StudioArticleDetail,
} from './dto/get-article.dto';
import type { PublishedArticle } from './dto/publish-article.dto';
import type {
  PublicArticleDetail,
  PublicArticleListItem,
} from './dto/public-article.dto';
import type { ArticleMedia } from './dto/article-media.dto';
import type { SubmittedArticle } from './dto/submit-review.dto';
import type { DeletedArticle } from './dto/update-article.dto';

export type CreateDraftInput = {
  authorId: string;
  title: string;
  slug: string;
  content: ContentBlock[];
  tagIds?: string[];
  /** Optional cover image media UUID (must be an image resource). */
  coverMediaId?: string;
};

export type ListArticlesInput = {
  /** When set, restricts results to this author only (Author role). */
  authorId?: string;
  page: number;
  limit: number;
  /** Workflow position, derived from the revision pointers. */
  status?: ArticleStatusFilter;
  /** Case-insensitive partial title match. */
  search?: string;
  /** Keeps soft-deleted rows in the result for moderation and trash views. */
  includeDeleted?: boolean;
};

export type GetStudioArticleInput = {
  id: string;
  /** When set, ownership is enforced: only the matching author's article is returned. */
  authorId?: string;
};

export type ListPublicArticlesInput = {
  page: number;
  limit: number;
  /** Case-insensitive partial title match. */
  search?: string;
  /** Case-insensitive exact tag name match. */
  tag?: string;
};

export type CreateRevisionInput = {
  articleId: string;
  content: ContentBlock[];
  createdBy: string;
  coverMediaId?: string;
  /** When set, ownership is enforced before the revision is written. */
  authorId?: string;
};

export type UpdateArticleInput = {
  id: string;
  title?: string;
  slug?: string;
  tagIds?: string[];
  /** When set, ownership is enforced before the update is written. */
  authorId?: string;
};

export type SoftDeleteArticleInput = {
  id: string;
  /** When set, ownership is enforced before the soft delete is written. */
  authorId?: string;
};

/** 1-based position of a pointed-at revision in chronological history, if set. */
function revisionNumberOf(
  revisions: ReadonlyArray<{ id: string }>,
  revisionId: string | null,
): number | null {
  if (revisionId === null) return null;
  const index = revisions.findIndex((revision) => revision.id === revisionId);
  return index === -1 ? null : index + 1;
}

export type SubmitForReviewInput = {
  articleId: string;
  /** When set, ownership is enforced before the submission is written. */
  authorId?: string;
};

/**
 * SQL for each workflow position. There is no status column, so every filter is
 * expressed against the revision pointers. `IS DISTINCT FROM` is used instead of
 * `<>` so a null published pointer still counts as "different from" a submission.
 *
 * Written with raw column names rather than entity property paths, because
 * TypeORM only rewrites `alias.property` inside `where` expressions — a raw
 * `select` used for aggregate counts is passed through untouched.
 */
const ARTICLE_STATUS_SQL: Record<ArticleStatusFilter, string> = {
  draft:
    'article.published_revision_id IS NULL AND article.submitted_revision_id IS NULL',
  review:
    'article.submitted_revision_id IS NOT NULL AND ' +
    'article.submitted_revision_id IS DISTINCT FROM article.published_revision_id',
  published: 'article.published_revision_id IS NOT NULL',
};

/**
 * Flattens the revision_media index into a de-duplicated lookup that clients can
 * join against the `mediaId` on inline blocks. Soft-deleted assets are dropped.
 */
function toResolvedMedia(links: RevisionMedia[] | undefined): ArticleMedia[] {
  const byId = new Map<string, ArticleMedia>();

  for (const link of links ?? []) {
    if (!link.media || link.media.deletedAt !== null) continue;
    byId.set(link.media.id, {
      id: link.media.id,
      secureUrl: link.media.secureUrl,
      resourceType: link.media.resourceType,
      width: link.media.width,
      height: link.media.height,
      defaultAltText: link.media.defaultAltText,
    });
  }

  return [...byId.values()];
}

export type GetPublicArticleBySlugInput = {
  slug: string;
};

export type PublishRevisionInput = {
  articleId: string;
  revisionId: string;
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
    private readonly dataSource: DataSource,
  ) {}

  async createDraft(input: CreateDraftInput) {
    const mediaRefs = collectMediaRefs(input.content);
    const coverMediaId = input.coverMediaId ?? null;

    const selectedTags = await this.resolveTags(input.tagIds);
    await this.assertMediaReferencesValid(mediaRefs, coverMediaId);

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
        coverMediaId,
      });

      // 5. Derived revision_media index for cover + inline image/video blocks
      const revisionMediaRows = [
        ...(coverMediaId
          ? [
              {
                revisionId: revision.id,
                mediaId: coverMediaId,
                blockId: 'cover',
                role: 'cover' as const,
              },
            ]
          : []),
        ...mediaRefs.map((ref) => ({
          revisionId: revision.id,
          mediaId: ref.mediaId,
          blockId: ref.blockId,
          role: 'inline' as const,
        })),
      ];

      if (revisionMediaRows.length > 0) {
        await this.revisionMediaRepo.save(revisionMediaRows);
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

      throw this.toSlugConflict(err);
    }
  }

  async listArticles(
    input: ListArticlesInput,
  ): Promise<{ items: ArticleListItem[]; total: number }> {
    const qb = this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.articleTags', 'articleTag')
      .leftJoinAndSelect('articleTag.tag', 'tag')
      // Ids and timestamps only — revision content would bloat every list response.
      .leftJoin('article.revisions', 'revision')
      .addSelect(['revision.id', 'revision.createdAt']);

    if (input.includeDeleted) {
      qb.withDeleted();
    } else {
      qb.andWhere('article.deletedAt IS NULL');
    }

    if (input.authorId) {
      qb.andWhere('article.authorId = :authorId', { authorId: input.authorId });
    }

    if (input.search) {
      qb.andWhere('article.title ILIKE :search', { search: `%${input.search}%` });
    }

    if (input.status) {
      qb.andWhere(`(${ARTICLE_STATUS_SQL[input.status]})`);
    }

    const [rows, total] = await qb
      .orderBy('article.updatedAt', 'DESC')
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getManyAndCount();

    return {
      items: rows.map((article) => {
        const revisions = [...article.revisions].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );

        return {
          id: article.id,
          authorId: article.authorId,
          title: article.title,
          slug: article.slug,
          publishedRevisionId: article.publishedRevisionId,
          publishedAt: article.publishedAt,
          submittedRevisionId: article.submittedRevisionId,
          submittedAt: article.submittedAt,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          deletedAt: article.deletedAt,
          revisionCount: revisions.length,
          latestRevisionId: revisions.at(-1)?.id ?? null,
          submittedRevisionNumber: revisionNumberOf(
            revisions,
            article.submittedRevisionId,
          ),
          publishedRevisionNumber: revisionNumberOf(
            revisions,
            article.publishedRevisionId,
          ),
          tags: article.articleTags.map((at) => ({ id: at.tag.id, name: at.tag.name })),
        };
      }),
      total,
    };
  }

  /**
   * Counts the whole articles table in one pass so dashboards never derive
   * platform totals from a single page of results.
   */
  async countArticlesByState(): Promise<ArticleStatsResponse> {
    const live = 'article.deleted_at IS NULL';

    const row = await this.articleRepo
      .createQueryBuilder('article')
      .withDeleted()
      .select(`COUNT(*) FILTER (WHERE ${live})`, 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE ${live} AND ${ARTICLE_STATUS_SQL.published})`,
        'published',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE ${live} AND ${ARTICLE_STATUS_SQL.draft})`,
        'drafts',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE ${live} AND ${ARTICLE_STATUS_SQL.review})`,
        'pendingReview',
      )
      .addSelect('COUNT(*) FILTER (WHERE article.deleted_at IS NOT NULL)', 'deleted')
      .getRawOne<Record<keyof ArticleStatsResponse, string>>();

    return {
      total: Number(row?.total ?? 0),
      published: Number(row?.published ?? 0),
      drafts: Number(row?.drafts ?? 0),
      pendingReview: Number(row?.pendingReview ?? 0),
      deleted: Number(row?.deleted ?? 0),
    };
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
        revisions: { revisionMedia: { media: true } },
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
      submittedRevisionId: article.submittedRevisionId,
      submittedAt: article.submittedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      tags: article.articleTags.map((at) => ({ id: at.tag.id, name: at.tag.name })),
      revisions: article.revisions.map((r) => ({
        id: r.id,
        createdBy: r.createdBy,
        coverMediaId: r.coverMediaId,
        content: r.content,
        createdAt: r.createdAt,
        media: toResolvedMedia(r.revisionMedia),
      })),
    };
  }

  async listPublicArticles(
    input: ListPublicArticlesInput,
  ): Promise<{ items: PublicArticleListItem[]; total: number }> {
    const qb = this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.articleTags', 'articleTag')
      .leftJoinAndSelect('articleTag.tag', 'tag')
      .leftJoinAndSelect('article.publishedRevision', 'publishedRevision')
      .leftJoinAndSelect('publishedRevision.coverMedia', 'coverMedia')
      .where('article.deletedAt IS NULL')
      .andWhere('article.publishedRevisionId IS NOT NULL');

    if (input.search) {
      qb.andWhere('article.title ILIKE :search', { search: `%${input.search}%` });
    }

    if (input.tag) {
      // EXISTS rather than filtering the join, so matched rows keep their full tag list.
      qb.andWhere(
        `EXISTS (${qb
          .subQuery()
          .select('1')
          .from(ArticleTag, 'filterArticleTag')
          .innerJoin(Tag, 'filterTag', 'filterTag.id = filterArticleTag.tagId')
          .where('filterArticleTag.articleId = article.id')
          .andWhere('LOWER(filterTag.name) = :tag')
          .getQuery()})`,
        { tag: input.tag },
      );
    }

    const [rows, total] = await qb
      .orderBy('article.publishedAt', 'DESC')
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getManyAndCount();

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
        publishedRevision: { coverMedia: true, revisionMedia: { media: true } },
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
        media: toResolvedMedia(published.revisionMedia),
      },
    };
  }

  /**
   * Set the article's published revision pointer.
   * Both publishedRevisionId and publishedAt are written in one UPDATE.
   * Does not copy revision content onto the article or touch tags/revisions.
   */
  async publishRevision(input: PublishRevisionInput): Promise<PublishedArticle> {
    // One transaction so the pointer and its timestamp can never diverge and
    // break CHK_articles_published_pair.
    return this.dataSource.transaction(async (manager) => {
      const article = await manager.findOne(Article, {
        where: { id: input.articleId, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!article) {
        throw new NotFoundException('Article not found');
      }

      const revision = await manager.findOne(Revision, {
        where: {
          id: input.revisionId,
          articleId: input.articleId,
        },
      });
      if (!revision) {
        throw new NotFoundException('Revision not found');
      }

      // Reuse create-time content rules; reject empty/invalid revisions.
      try {
        parseContentBlocks(revision.content);
      } catch (err) {
        if (err instanceof BadRequestException) {
          throw err;
        }
        throw new BadRequestException('Revision content is invalid');
      }

      const publishedAt = new Date();

      // Only the publish pointer moves. The submission pointer is left alone so
      // the history of what was reviewed stays intact.
      await manager.update(
        Article,
        { id: article.id },
        {
          publishedRevisionId: revision.id,
          publishedAt,
        },
      );

      return {
        id: article.id,
        publishedRevisionId: revision.id,
        publishedAt,
      };
    });
  }

  /**
   * Points the review queue at the article's newest revision.
   * Never touches `publishedRevisionId` — an Author submitting for review must
   * not be able to make anything public.
   */
  async submitForReview(input: SubmitForReviewInput): Promise<SubmittedArticle> {
    return this.dataSource.transaction(async (manager) => {
      const article = await manager.findOne(Article, {
        where: {
          id: input.articleId,
          deletedAt: IsNull(),
          ...(input.authorId ? { authorId: input.authorId } : {}),
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!article) {
        throw new NotFoundException('Article not found');
      }

      const revisions = await manager.find(Revision, {
        where: { articleId: article.id },
        select: { id: true, content: true, createdAt: true },
        order: { createdAt: 'ASC' },
      });

      const latest = revisions.at(-1);
      if (!latest) {
        throw new BadRequestException('Article has no revision to submit');
      }

      try {
        parseContentBlocks(latest.content);
      } catch (err) {
        if (err instanceof BadRequestException) {
          throw err;
        }
        throw new BadRequestException('Revision content is invalid');
      }

      const submittedAt = new Date();

      await manager.update(
        Article,
        { id: article.id },
        {
          submittedRevisionId: latest.id,
          submittedAt,
        },
      );

      return {
        id: article.id,
        submittedRevisionId: latest.id,
        submittedAt,
        submittedRevisionNumber: revisions.length,
        publishedRevisionId: article.publishedRevisionId,
      };
    });
  }

  /**
   * Append a revision to an existing article.
   * Deliberately leaves `publishedRevisionId` untouched: a new revision is a draft
   * until an editor publishes it, even when the article is already public.
   */
  async createRevision(input: CreateRevisionInput): Promise<{
    revision: Revision;
    revisionNumber: number;
    publishedRevisionId: string | null;
  }> {
    const article = await this.findOwnedArticle(input.articleId, input.authorId);

    const mediaRefs = collectMediaRefs(input.content);
    const coverMediaId = input.coverMediaId ?? null;
    await this.assertMediaReferencesValid(mediaRefs, coverMediaId);

    const revision = await this.revisionRepo.save({
      articleId: article.id,
      content: input.content,
      createdBy: input.createdBy,
      coverMediaId,
    });

    const revisionMediaRows = [
      ...(coverMediaId
        ? [
            {
              revisionId: revision.id,
              mediaId: coverMediaId,
              blockId: 'cover',
              role: 'cover' as const,
            },
          ]
        : []),
      ...mediaRefs.map((ref) => ({
        revisionId: revision.id,
        mediaId: ref.mediaId,
        blockId: ref.blockId,
        role: 'inline' as const,
      })),
    ];

    if (revisionMediaRows.length > 0) {
      await this.revisionMediaRepo.save(revisionMediaRows);
    }

    // Keeps the article at the top of the updatedAt-sorted studio list.
    await this.articleRepo.update({ id: article.id }, { updatedAt: new Date() });

    const revisionNumber = await this.revisionRepo.count({
      where: { articleId: article.id },
    });

    return {
      revision,
      revisionNumber,
      publishedRevisionId: article.publishedRevisionId,
    };
  }

  /** Update article metadata only. Content changes go through createRevision. */
  async updateArticle(input: UpdateArticleInput): Promise<void> {
    const article = await this.findOwnedArticle(input.id, input.authorId);

    // Resolve tags before writing anything so an invalid id fails the whole patch.
    const selectedTags = input.tagIds ? await this.resolveTags(input.tagIds) : null;

    const changes: { title?: string; slug?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (input.title !== undefined) changes.title = input.title;
    if (input.slug !== undefined) changes.slug = input.slug;

    // Slug is the only uniqueness risk here, so take it before touching tags.
    try {
      await this.articleRepo.update({ id: article.id }, changes);
    } catch (err) {
      throw this.toSlugConflict(err);
    }

    if (selectedTags) {
      await this.articleTagRepo.delete({ articleId: article.id });

      if (selectedTags.length > 0) {
        await this.articleTagRepo.save(
          selectedTags.map((tag) => ({ articleId: article.id, tagId: tag.id })),
        );
      }
    }
  }

  /**
   * Soft delete: sets `deletedAt` so the row stays for audit and FK integrity.
   * Every read path already filters on `deletedAt IS NULL`, so this removes the
   * article from the public blog and from studio listings in one write.
   */
  async softDeleteArticle(input: SoftDeleteArticleInput): Promise<DeletedArticle> {
    const article = await this.findOwnedArticle(input.id, input.authorId);

    await this.articleRepo.softDelete(article.id);

    const deleted = await this.articleRepo.findOne({
      where: { id: article.id },
      withDeleted: true,
    });

    return { id: article.id, deletedAt: deleted?.deletedAt ?? new Date() };
  }

  private async findOwnedArticle(id: string, authorId?: string): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
        ...(authorId ? { authorId } : {}),
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  private async resolveTags(tagIds?: string[]): Promise<Tag[]> {
    const ids = [...new Set(tagIds ?? [])];
    if (ids.length === 0) return [];

    const selected = await this.tagRepo.find({ where: { id: In(ids) } });

    if (selected.length !== ids.length) {
      const found = new Set(selected.map((tag) => tag.id));
      throw new BadRequestException({
        message: 'One or more tag IDs are invalid',
        details: { tagIds: ids.filter((id) => !found.has(id)) },
      });
    }

    return selected;
  }

  /** Rejects media that is missing, soft-deleted, or the wrong resource type. */
  private async assertMediaReferencesValid(
    mediaRefs: MediaRef[],
    coverMediaId: string | null,
  ): Promise<void> {
    const mediaIdsToValidate = [
      ...new Set([
        ...mediaRefs.map((ref) => ref.mediaId),
        ...(coverMediaId ? [coverMediaId] : []),
      ]),
    ];

    if (mediaIdsToValidate.length === 0) return;

    const mediaRows = await this.mediaRepo.find({
      where: { id: In(mediaIdsToValidate), deletedAt: IsNull() },
    });
    const byId = new Map(mediaRows.map((row) => [row.id, row]));

    const missing = mediaIdsToValidate.filter((id) => !byId.has(id));
    if (missing.length > 0) {
      throw new BadRequestException({
        message: 'One or more media IDs are invalid',
        details: { mediaIds: missing },
      });
    }

    if (coverMediaId) {
      const cover = byId.get(coverMediaId);
      if (cover && cover.resourceType !== 'image') {
        throw new BadRequestException({
          message: 'Cover media must be an image',
          details: { coverMediaId, actual: cover.resourceType },
        });
      }
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

  private toSlugConflict(err: unknown): unknown {
    if (
      err instanceof QueryFailedError &&
      (err.driverError as { code?: string })?.code === '23505' &&
      (err.driverError as { constraint?: string })?.constraint === 'UQ_articles_slug'
    ) {
      return new ConflictException('An article with this slug already exists');
    }

    return err;
  }
}
