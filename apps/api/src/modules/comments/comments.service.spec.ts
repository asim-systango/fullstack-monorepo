import { NotFoundException } from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

const ARTICLE_ID = 'b2c3d4e5-f6a7-4890-abcd-ef1234567890';

const author: JwtUser = {
  id: 'author-1',
  email: 'author@example.com',
  role: Role.Author,
};

describe('CommentsService published-only writes', () => {
  const repository = {
    isPublishedArticle: jest.fn(),
    createComment: jest.fn(),
  };

  const service = new CommentsService(repository as unknown as CommentsRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('404s a comment on a draft or unpublished article', async () => {
    repository.isPublishedArticle.mockResolvedValue(false);

    await expect(
      service.createComment(ARTICLE_ID, { body: 'Nice piece.' }, author),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.createComment).not.toHaveBeenCalled();
  });
});
