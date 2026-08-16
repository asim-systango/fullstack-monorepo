import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';

const ARTICLE_ID = 'b2c3d4e5-f6a7-4890-abcd-ef1234567890';
const TAG_ID = 'd4e5f6a7-b8c9-4890-abcd-ef1234567890';

const author: JwtUser = {
  id: 'author-1',
  email: 'author@example.com',
  role: Role.Author,
};

const editor: JwtUser = {
  id: 'editor-1',
  email: 'editor@example.com',
  role: Role.Editor,
};

describe('ArticlesService createRevision', () => {
  const repository = {
    createRevision: jest.fn(),
  };

  const service = new ArticlesService(repository as unknown as ArticlesRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    repository.createRevision.mockResolvedValue({
      revision: {
        id: 'rev-2',
        content: [{ type: 'paragraph', markdown: 'Updated' }],
        coverMediaId: null,
        createdBy: author.id,
        createdAt: new Date('2026-08-16T10:00:00.000Z'),
      },
      revisionNumber: 2,
      publishedRevisionId: 'rev-1',
    });
  });

  it('forwards title, slug, and tagIds in the same repository call', async () => {
    await expect(
      service.createRevision(
        ARTICLE_ID,
        {
          body: 'Updated',
          title: 'New title',
          slug: 'new-title',
          tagIds: [TAG_ID],
        },
        author,
      ),
    ).resolves.toEqual({
      id: 'rev-2',
      articleId: ARTICLE_ID,
      content: [{ type: 'paragraph', markdown: 'Updated' }],
      coverMediaId: null,
      createdBy: author.id,
      createdAt: new Date('2026-08-16T10:00:00.000Z'),
      revisionNumber: 2,
      publishedRevisionId: 'rev-1',
    });

    expect(repository.createRevision).toHaveBeenCalledWith({
      articleId: ARTICLE_ID,
      content: [expect.objectContaining({ type: 'paragraph', markdown: 'Updated' })],
      createdBy: author.id,
      coverMediaId: undefined,
      authorId: author.id,
      title: 'New title',
      slug: 'new-title',
      tagIds: [TAG_ID],
    });
  });

  it('does not scope editors to their own articles', async () => {
    await service.createRevision(ARTICLE_ID, { body: 'Updated' }, editor);

    expect(repository.createRevision).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: undefined,
        title: undefined,
        slug: undefined,
        tagIds: undefined,
      }),
    );
  });
});
