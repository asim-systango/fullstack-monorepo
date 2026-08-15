import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';

const REVISION_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const ARTICLE_ID = 'b2c3d4e5-f6a7-4890-abcd-ef1234567890';
const AUTHOR_ID = 'c3d4e5f6-a7b8-4890-abcd-ef1234567890';

const editor: JwtUser = {
  id: 'editor-1',
  email: 'editor@example.com',
  role: Role.Editor,
};

const owningEditor: JwtUser = {
  id: AUTHOR_ID,
  email: 'owner-editor@example.com',
  role: Role.Editor,
};

const admin: JwtUser = {
  id: AUTHOR_ID,
  email: 'admin@example.com',
  role: Role.Admin,
};

describe('ArticlesService publish and schedule', () => {
  const repository = {
    findLiveAuthorId: jest.fn(),
    publishRevision: jest.fn(),
    scheduleRevision: jest.fn(),
    executeDueSchedules: jest.fn(),
  };

  const service = new ArticlesService(repository as unknown as ArticlesRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    repository.findLiveAuthorId.mockResolvedValue(AUTHOR_ID);
  });

  it('publishes immediately through the existing pointer update', async () => {
    const published = {
      id: ARTICLE_ID,
      publishedRevisionId: REVISION_ID,
      publishedAt: new Date('2026-08-15T10:00:00.000Z'),
    };
    repository.publishRevision.mockResolvedValue(published);

    await expect(
      service.publishArticle(ARTICLE_ID, { revisionId: REVISION_ID }, editor),
    ).resolves.toEqual(published);

    expect(repository.publishRevision).toHaveBeenCalledWith({
      articleId: ARTICLE_ID,
      revisionId: REVISION_ID,
    });
    expect(repository.scheduleRevision).not.toHaveBeenCalled();
  });

  it('rejects an editor publishing their own article', async () => {
    await expect(
      service.publishArticle(ARTICLE_ID, { revisionId: REVISION_ID }, owningEditor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.publishRevision).not.toHaveBeenCalled();
  });

  it('lets an admin publish an article they authored', async () => {
    repository.publishRevision.mockResolvedValue({
      id: ARTICLE_ID,
      publishedRevisionId: REVISION_ID,
      publishedAt: new Date(),
    });

    await service.publishArticle(ARTICLE_ID, { revisionId: REVISION_ID }, admin);
    expect(repository.publishRevision).toHaveBeenCalled();
  });

  it('schedules a future publish without moving the public pointer', async () => {
    const scheduledAt = new Date(Date.now() + 60_000).toISOString();
    const scheduled = {
      id: ARTICLE_ID,
      scheduledRevisionId: REVISION_ID,
      scheduledAt: new Date(scheduledAt),
    };
    repository.scheduleRevision.mockResolvedValue(scheduled);

    await expect(
      service.schedulePublish(
        ARTICLE_ID,
        { revisionId: REVISION_ID, scheduledAt },
        editor,
      ),
    ).resolves.toEqual(scheduled);

    expect(repository.publishRevision).not.toHaveBeenCalled();
    expect(repository.scheduleRevision).toHaveBeenCalledWith({
      articleId: ARTICLE_ID,
      revisionId: REVISION_ID,
      scheduledAt: new Date(scheduledAt),
    });
  });

  it('rejects an editor scheduling their own article', async () => {
    await expect(
      service.schedulePublish(
        ARTICLE_ID,
        {
          revisionId: REVISION_ID,
          scheduledAt: new Date(Date.now() + 60_000).toISOString(),
        },
        owningEditor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.scheduleRevision).not.toHaveBeenCalled();
  });

  it('rejects a past scheduled time', async () => {
    await expect(
      service.schedulePublish(
        ARTICLE_ID,
        {
          revisionId: REVISION_ID,
          scheduledAt: new Date(Date.now() - 1_000).toISOString(),
        },
        editor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.scheduleRevision).not.toHaveBeenCalled();
  });

  it('rejects a scheduled time equal to now', async () => {
    const now = new Date('2026-08-15T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    await expect(
      service.schedulePublish(
        ARTICLE_ID,
        { revisionId: REVISION_ID, scheduledAt: now.toISOString() },
        editor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.scheduleRevision).not.toHaveBeenCalled();
  });

  it('404s when scheduling a missing or deleted article', async () => {
    repository.findLiveAuthorId.mockResolvedValue(null);

    await expect(
      service.schedulePublish(
        ARTICLE_ID,
        {
          revisionId: REVISION_ID,
          scheduledAt: new Date(Date.now() + 60_000).toISOString(),
        },
        editor,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.scheduleRevision).not.toHaveBeenCalled();
  });

  it('runs due jobs through the existing publish method', async () => {
    const published = {
      id: ARTICLE_ID,
      publishedRevisionId: REVISION_ID,
      publishedAt: new Date(),
    };
    repository.executeDueSchedules.mockResolvedValue({
      published: [published],
      skipped: 0,
    });

    await expect(service.runDueSchedules()).resolves.toEqual({
      published: [published],
      skipped: 0,
    });
    expect(repository.executeDueSchedules).toHaveBeenCalled();
  });
});
