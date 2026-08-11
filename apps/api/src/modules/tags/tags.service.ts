import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import type { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import type { ListTagsQuery, TagListResponse, TagResponse } from './dto/get-tag.dto';

const TAG_ATTACHED_TO_PUBLISHED_ARTICLE =
  'Cannot modify a tag that is used on a published article';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async createTag(dto: CreateTagDto): Promise<TagResponse> {
    return this.tagsRepository.createTag({ name: dto.name });
  }

  async listTags(query: ListTagsQuery): Promise<TagListResponse> {
    const { items, total } = await this.tagsRepository.listTags({
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

  async getTagById(id: string): Promise<TagResponse> {
    const tag = await this.tagsRepository.findTagById(id);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async updateTag(id: string, dto: UpdateTagDto): Promise<TagResponse> {
    await this.ensureTagExists(id);
    await this.ensureTagNotOnPublishedArticle(id);

    const tag = await this.tagsRepository.updateTag({ id, name: dto.name });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await this.ensureTagExists(id);
    await this.ensureTagNotOnPublishedArticle(id);

    const deleted = await this.tagsRepository.deleteTag(id);
    if (!deleted) {
      throw new NotFoundException('Tag not found');
    }
  }

  private async ensureTagExists(id: string): Promise<void> {
    const tag = await this.tagsRepository.findTagById(id);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
  }

  private async ensureTagNotOnPublishedArticle(id: string): Promise<void> {
    const attached = await this.tagsRepository.isAttachedToPublishedArticle(id);
    if (attached) {
      throw new ConflictException(TAG_ATTACHED_TO_PUBLISHED_ARTICLE);
    }
  }
}
