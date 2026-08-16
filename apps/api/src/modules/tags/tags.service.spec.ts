import { ConflictException } from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import { TagsService } from './tags.service';

const TAG_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

describe('TagsService published-article lock', () => {
  const repository = {
    findTagById: jest.fn(),
    isAttachedToPublishedArticle: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
  };

  const service = new TagsService(repository as unknown as TagsRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findTagById.mockResolvedValue({
      id: TAG_ID,
      name: 'generative ai',
      normalizedName: 'generative ai',
    });
    repository.isAttachedToPublishedArticle.mockResolvedValue(true);
  });

  it('409s a rename when the tag is used on a published article', async () => {
    await expect(service.updateTag(TAG_ID, { name: 'llms' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.updateTag).not.toHaveBeenCalled();
  });

  it('409s a delete when the tag is used on a published article', async () => {
    await expect(service.deleteTag(TAG_ID)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.deleteTag).not.toHaveBeenCalled();
  });
});
