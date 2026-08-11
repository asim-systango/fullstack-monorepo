import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Tag } from './tag.entity';
import type { TagListItem, TagResponse } from './dto/get-tag.dto';

export type CreateTagInput = {
  /** Already trimmed and lowercased */
  name: string;
};

export type UpdateTagInput = {
  id: string;
  /** Already trimmed and lowercased */
  name: string;
};

export type ListTagsInput = {
  page: number;
  limit: number;
};

@Injectable()
export class TagsRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async createTag(input: CreateTagInput): Promise<TagResponse> {
    try {
      const tag = await this.tagRepo.save({
        name: input.name,
        normalizedName: input.name,
      });
      return this.toTagResponse(tag);
    } catch (err) {
      this.throwIfDuplicateTagName(err);
    }
  }

  async listTags(input: ListTagsInput): Promise<{ items: TagListItem[]; total: number }> {
    const [rows, total] = await this.tagRepo.findAndCount({
      select: { id: true, name: true },
      order: { name: 'ASC' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    });
    return {
      items: rows.map((tag) => ({ id: tag.id, name: tag.name })),
      total,
    };
  }

  async findTagById(id: string): Promise<TagResponse | null> {
    const tag = await this.tagRepo.findOne({
      where: { id },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return tag ? this.toTagResponse(tag) : null;
  }

  /**
   * True when the tag is attached to at least one non-deleted published article.
   * Draft-only attachments do not count.
   */
  async isAttachedToPublishedArticle(tagId: string): Promise<boolean> {
    const count = await this.tagRepo
      .createQueryBuilder('tag')
      .innerJoin('tag.articleTags', 'articleTag')
      .innerJoin('articleTag.article', 'article')
      .where('tag.id = :tagId', { tagId })
      .andWhere('article.published_revision_id IS NOT NULL')
      .andWhere('article.deleted_at IS NULL')
      .getCount();
    return count > 0;
  }

  async updateTag(input: UpdateTagInput): Promise<TagResponse | null> {
    const existing = await this.tagRepo.findOne({ where: { id: input.id } });
    if (!existing) return null;

    existing.name = input.name;
    existing.normalizedName = input.name;

    try {
      const saved = await this.tagRepo.save(existing);
      return this.toTagResponse(saved);
    } catch (err) {
      this.throwIfDuplicateTagName(err);
    }
  }

  /**
   * Deletes the tag. ArticleTag rows are removed by FK ON DELETE CASCADE.
   * Returns false when the tag does not exist.
   */
  async deleteTag(id: string): Promise<boolean> {
    const result = await this.tagRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toTagResponse(tag: Tag): TagResponse {
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  private throwIfDuplicateTagName(err: unknown): never {
    if (
      err instanceof QueryFailedError &&
      (err.driverError as { code?: string; constraint?: string })?.code === '23505' &&
      (err.driverError as { constraint?: string })?.constraint ===
        'UQ_tags_normalized_name'
    ) {
      throw new ConflictException('A tag with this name already exists');
    }
    throw err;
  }
}
