import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';

describe('ArticlesRepository scheduled publish', () => {
  const articleRepo = { find: jest.fn(), update: jest.fn() };

  const repository = new ArticlesRepository(
    articleRepo as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('executeDueSchedules', () => {
    it('publishes due articles through publishRevision with the scheduled revision', async () => {
      articleRepo.find.mockResolvedValue([
        { id: 'article-1', scheduledRevisionId: 'revision-3' },
      ]);
      const published = {
        id: 'article-1',
        publishedRevisionId: 'revision-3',
        publishedAt: new Date('2026-08-15T10:00:00.000Z'),
      };
      const publish = jest
        .spyOn(repository, 'publishRevision')
        .mockResolvedValue(published);

      await expect(repository.executeDueSchedules()).resolves.toEqual({
        published: [published],
        skipped: 0,
      });
      expect(publish).toHaveBeenCalledWith({
        articleId: 'article-1',
        revisionId: 'revision-3',
      });
      expect(published.publishedRevisionId).toBe('revision-3');
      expect(published.publishedAt).toBeInstanceOf(Date);
    });

    it('does not publish when no due schedules exist', async () => {
      articleRepo.find.mockResolvedValue([]);
      const publish = jest.spyOn(repository, 'publishRevision');

      await expect(repository.executeDueSchedules()).resolves.toEqual({
        published: [],
        skipped: 0,
      });
      expect(publish).not.toHaveBeenCalled();
    });

    it('skips a deleted article without publishing it', async () => {
      articleRepo.find.mockResolvedValue([
        { id: 'deleted-article', scheduledRevisionId: 'revision-3' },
      ]);
      jest
        .spyOn(repository, 'publishRevision')
        .mockRejectedValue(new NotFoundException('Article not found'));
      articleRepo.update.mockResolvedValue({ affected: 1 });

      await expect(repository.executeDueSchedules()).resolves.toEqual({
        published: [],
        skipped: 1,
      });
      expect(articleRepo.update).toHaveBeenCalledWith(
        { id: 'deleted-article' },
        { scheduledRevisionId: null, scheduledAt: null },
      );
    });

    it('skips invalid revision content without publishing', async () => {
      articleRepo.find.mockResolvedValue([
        { id: 'article-1', scheduledRevisionId: 'revision-3' },
      ]);
      jest
        .spyOn(repository, 'publishRevision')
        .mockRejectedValue(new BadRequestException('Revision content is invalid'));

      await expect(repository.executeDueSchedules()).resolves.toEqual({
        published: [],
        skipped: 1,
      });
    });
  });
});
