import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { IssuesService } from './issues.service';
import type { JwtUser } from '../../common/auth';

describe('IssuesService review fixes', () => {
  const memberUser: JwtUser = {
    id: 'member-1',
    email: 'user@demo.local',
    role: 'user',
  };
  const leadUser: JwtUser = {
    id: 'lead-1',
    email: 'staff@demo.local',
    role: 'staff',
  };

  function buildService(overrides?: {
    membershipRole?: 'lead' | 'member';
    issue?: Record<string, unknown>;
  }) {
    const issue = {
      id: 'issue-1',
      projectId: 'project-1',
      status: 'in_progress',
      assigneeId: 'member-1',
      reporterId: 'lead-1',
      deletedAt: null,
      title: 'Test',
      description: '',
      ...overrides?.issue,
    };

    const projectsService = {
      assertMember: jest.fn().mockResolvedValue({
        role: overrides?.membershipRole ?? 'member',
      }),
      assertCanView: jest.fn().mockResolvedValue(undefined),
      assertAssigneeInProject: jest.fn().mockResolvedValue(undefined),
    };

    const issuesRepo = {
      findOne: jest.fn().mockResolvedValue(issue),
    };

    const manager = {
      findOne: jest.fn().mockResolvedValue({ ...issue }),
      update: jest.fn(),
      save: jest.fn().mockImplementation(async (entity) => entity),
      softRemove: jest.fn(),
      create: jest.fn().mockImplementation((_cls, data) => data),
      delete: jest.fn(),
    };

    const dataSource = {
      transaction: jest.fn(async (fn: (m: typeof manager) => Promise<unknown>) =>
        fn(manager),
      ),
    };

    const issuesEvents = { emitIssueUpdated: jest.fn() };

    const service = new IssuesService(
      issuesRepo as never,
      { find: jest.fn().mockResolvedValue([]), save: jest.fn() } as never,
      { find: jest.fn().mockResolvedValue([]), save: jest.fn() } as never,
      { createQueryBuilder: jest.fn() } as never,
      {} as never,
      projectsService as never,
      dataSource as never,
      issuesEvents as never,
    );

    // getOne after mutations
    jest.spyOn(service, 'getOne').mockResolvedValue({ id: issue.id } as never);

    return { service, projectsService, manager, issuesEvents, issue };
  }

  it('rejects delete for a non-lead non-reporter member', async () => {
    const { service } = buildService({ membershipRole: 'member' });
    await expect(service.softDelete(memberUser, 'issue-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows delete for the reporter and writes activity', async () => {
    const { service, manager, issuesEvents } = buildService({
      membershipRole: 'member',
      issue: { reporterId: memberUser.id },
    });
    await service.softDelete(memberUser, 'issue-1');
    expect(manager.softRemove).toHaveBeenCalled();
    expect(manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'deleted' }),
    );
    expect(issuesEvents.emitIssueUpdated).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'deleted' }),
    );
  });

  it('only checks assignee when assigneeId is present on update', async () => {
    const { service, projectsService } = buildService();
    await service.update(memberUser, 'issue-1', { title: 'New title' });
    expect(projectsService.assertAssigneeInProject).not.toHaveBeenCalled();

    await service.update(memberUser, 'issue-1', { assigneeId: 'member-1' });
    expect(projectsService.assertAssigneeInProject).toHaveBeenCalledWith(
      'project-1',
      'member-1',
    );
  });

  it('locks the issue row and rejects illegal status jumps', async () => {
    const { service, manager } = buildService({
      issue: { status: 'todo' },
    });
    manager.findOne.mockResolvedValue({
      id: 'issue-1',
      projectId: 'project-1',
      status: 'todo',
      deletedAt: null,
    });

    await expect(
      service.updateStatus(leadUser, 'issue-1', { status: 'done' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        lock: { mode: 'pessimistic_write' },
      }),
    );
  });
});
