import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { RevisionMedia } from '../media/revision-media.entity';
import { ArticleTag } from '../tags/article-tag.entity';
import { Article } from './article.entity';
import { ArticlesRepository } from './articles.repository';
import { Revision } from './revision.entity';
import type { ContentBlock } from './types/revision-content';

const CONTENT: ContentBlock[] = [{ id: 'block-1', type: 'paragraph', markdown: 'Hello' }];

function slugConflict(): QueryFailedError {
  return new QueryFailedError(
    'UPDATE',
    [],
    Object.assign(new Error('duplicate'), {
      code: '23505',
      constraint: 'UQ_articles_slug',
    }),
  );
}

describe('ArticlesRepository createDraft and createRevision', () => {
  const txArticleRepo = {
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const txRevisionRepo = {
    save: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };
  const txRevisionMediaRepo = { save: jest.fn() };
  const txArticleTagRepo = { save: jest.fn(), delete: jest.fn() };

  const reposByEntity = new Map<unknown, object>([
    [Article, txArticleRepo],
    [Revision, txRevisionRepo],
    [RevisionMedia, txRevisionMediaRepo],
    [ArticleTag, txArticleTagRepo],
  ]);

  const manager = {
    getRepository: jest.fn((entity: unknown) => {
      const repo = reposByEntity.get(entity);
      if (!repo) throw new Error('unexpected entity');
      return repo;
    }),
  };

  const dataSource = {
    transaction: jest.fn(async (work: (m: typeof manager) => Promise<unknown>) =>
      work(manager),
    ),
  };

  const repository = new ArticlesRepository(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    dataSource as never,
  );

  const internals = repository as unknown as {
    resolveTags: (tagIds?: string[]) => Promise<{ id: string; name: string }[]>;
    assertMediaReferencesValid: (
      mediaRefs: unknown,
      coverMediaId: string | null,
    ) => Promise<void>;
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    manager.getRepository.mockImplementation((entity: unknown) => {
      const repo = reposByEntity.get(entity);
      if (!repo) throw new Error('unexpected entity');
      return repo;
    });
    dataSource.transaction.mockImplementation(async (work) => work(manager));
    jest.spyOn(internals, 'resolveTags').mockResolvedValue([]);
    jest.spyOn(internals, 'assertMediaReferencesValid').mockResolvedValue(undefined);
  });

  describe('createDraft', () => {
    it('writes the article, first revision, and tags in one transaction', async () => {
      const article = { id: 'article-1', authorId: 'user-1', title: 'T', slug: 't' };
      const revision = {
        id: 'rev-1',
        articleId: article.id,
        content: CONTENT,
        createdBy: 'user-1',
        coverMediaId: null,
      };
      txArticleRepo.save.mockResolvedValue(article);
      txRevisionRepo.save.mockResolvedValue(revision);
      jest
        .spyOn(internals, 'resolveTags')
        .mockResolvedValue([{ id: 'tag-1', name: 'ai' }]);

      await expect(
        repository.createDraft({
          authorId: 'user-1',
          title: 'T',
          slug: 't',
          content: CONTENT,
          tagIds: ['tag-1'],
        }),
      ).resolves.toEqual({
        article,
        revision,
        tags: [{ id: 'tag-1', name: 'ai' }],
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(txArticleTagRepo.save).toHaveBeenCalledWith([
        { articleId: 'article-1', tagId: 'tag-1' },
      ]);
      expect(txArticleRepo.delete).not.toHaveBeenCalled();
      expect(txRevisionRepo.delete).not.toHaveBeenCalled();
    });

    it('maps a slug unique violation to ConflictException', async () => {
      txArticleRepo.save.mockRejectedValue(slugConflict());

      await expect(
        repository.createDraft({
          authorId: 'user-1',
          title: 'T',
          slug: 'taken',
          content: CONTENT,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('createRevision', () => {
    it('appends a revision and metadata inside one locked transaction', async () => {
      txArticleRepo.findOne.mockResolvedValue({
        id: 'article-1',
        publishedRevisionId: 'rev-1',
      });
      txRevisionRepo.save.mockResolvedValue({
        id: 'rev-2',
        articleId: 'article-1',
        content: CONTENT,
        createdBy: 'user-1',
        coverMediaId: null,
      });
      txArticleRepo.update.mockResolvedValue({ affected: 1 });
      txRevisionRepo.count.mockResolvedValue(2);
      jest
        .spyOn(internals, 'resolveTags')
        .mockResolvedValue([{ id: 'tag-1', name: 'ai' }]);

      await expect(
        repository.createRevision({
          articleId: 'article-1',
          content: CONTENT,
          createdBy: 'user-1',
          title: 'New title',
          slug: 'new-title',
          tagIds: ['tag-1'],
        }),
      ).resolves.toEqual({
        revision: expect.objectContaining({ id: 'rev-2' }),
        revisionNumber: 2,
        publishedRevisionId: 'rev-1',
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(txArticleRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          lock: { mode: 'pessimistic_write' },
        }),
      );
      expect(txArticleRepo.update).toHaveBeenCalledWith(
        { id: 'article-1' },
        expect.objectContaining({ title: 'New title', slug: 'new-title' }),
      );
      expect(txArticleTagRepo.delete).toHaveBeenCalledWith({ articleId: 'article-1' });
      expect(txArticleTagRepo.save).toHaveBeenCalledWith([
        { articleId: 'article-1', tagId: 'tag-1' },
      ]);
    });

    it('does not replace tags when tagIds are omitted', async () => {
      txArticleRepo.findOne.mockResolvedValue({
        id: 'article-1',
        publishedRevisionId: null,
      });
      txRevisionRepo.save.mockResolvedValue({
        id: 'rev-2',
        articleId: 'article-1',
        content: CONTENT,
        createdBy: 'user-1',
        coverMediaId: null,
      });
      txArticleRepo.update.mockResolvedValue({ affected: 1 });
      txRevisionRepo.count.mockResolvedValue(2);

      await repository.createRevision({
        articleId: 'article-1',
        content: CONTENT,
        createdBy: 'user-1',
      });

      expect(txArticleTagRepo.delete).not.toHaveBeenCalled();
      expect(txArticleRepo.update).toHaveBeenCalledWith(
        { id: 'article-1' },
        expect.objectContaining({ updatedAt: expect.any(Date) }),
      );
      expect(txArticleRepo.update.mock.calls[0][1]).not.toHaveProperty('title');
      expect(txArticleRepo.update.mock.calls[0][1]).not.toHaveProperty('slug');
    });

    it('404s when the article is missing', async () => {
      txArticleRepo.findOne.mockResolvedValue(null);

      await expect(
        repository.createRevision({
          articleId: 'missing',
          content: CONTENT,
          createdBy: 'user-1',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rolls the revision back by mapping a slug conflict from the same transaction', async () => {
      txArticleRepo.findOne.mockResolvedValue({
        id: 'article-1',
        publishedRevisionId: null,
      });
      txRevisionRepo.save.mockResolvedValue({
        id: 'rev-2',
        articleId: 'article-1',
        content: CONTENT,
        createdBy: 'user-1',
        coverMediaId: null,
      });
      txArticleRepo.update.mockRejectedValue(slugConflict());

      await expect(
        repository.createRevision({
          articleId: 'article-1',
          content: CONTENT,
          createdBy: 'user-1',
          slug: 'taken',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('updateArticle', () => {
    it('writes metadata and tags in one locked transaction', async () => {
      txArticleRepo.findOne.mockResolvedValue({ id: 'article-1' });
      txArticleRepo.update.mockResolvedValue({ affected: 1 });
      jest
        .spyOn(internals, 'resolveTags')
        .mockResolvedValue([{ id: 'tag-1', name: 'ai' }]);

      await repository.updateArticle({
        id: 'article-1',
        title: 'New title',
        tagIds: ['tag-1'],
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(txArticleRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          lock: { mode: 'pessimistic_write' },
        }),
      );
      expect(txArticleRepo.update).toHaveBeenCalledWith(
        { id: 'article-1' },
        expect.objectContaining({ title: 'New title' }),
      );
      expect(txArticleTagRepo.delete).toHaveBeenCalledWith({ articleId: 'article-1' });
      expect(txArticleTagRepo.save).toHaveBeenCalledWith([
        { articleId: 'article-1', tagId: 'tag-1' },
      ]);
    });
  });
});
