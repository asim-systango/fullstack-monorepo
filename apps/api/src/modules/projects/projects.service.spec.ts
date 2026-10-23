import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { JwtUser } from '../../common/auth';

describe('ProjectsService review fixes', () => {
  const lead: JwtUser = { id: 'lead-1', email: 'staff@demo.local', role: 'staff' };

  function buildService() {
    const project = {
      id: 'project-1',
      name: 'TF',
      key: 'TF',
      deletedAt: null,
    };

    const projects = {
      findOne: jest.fn().mockResolvedValue(project),
      findAndCount: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const members = {
      findOne: jest.fn().mockResolvedValue({
        id: 'm1',
        projectId: 'project-1',
        userId: lead.id,
        role: 'lead',
      }),
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(1),
      save: jest.fn().mockImplementation(async (row) => row),
      create: jest.fn().mockImplementation((row) => row),
      remove: jest.fn(),
    };

    const gatewayUsers = {
      findByEmail: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: lead.id,
        email: lead.email,
        name: 'Lead',
        role: 'staff',
      }),
    };

    const manager = {
      create: jest.fn().mockImplementation((_c, data) => data),
      save: jest.fn().mockImplementation(async (row) => row),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const dataSource = {
      transaction: jest.fn(async (fn: (m: typeof manager) => Promise<unknown>) =>
        fn(manager),
      ),
      query: jest.fn(),
    };

    const service = new ProjectsService(
      projects as never,
      members as never,
      dataSource as never,
      gatewayUsers as never,
    );

    return { service, projects, members, gatewayUsers, manager };
  }

  it('soft-deletes projects instead of hard-deleting', async () => {
    const { service, projects } = buildService();
    await service.remove(lead, 'project-1');
    expect(projects.softRemove).toHaveBeenCalled();
  });

  it('returns 404 for deleted projects on assertCanView', async () => {
    const { service, projects } = buildService();
    projects.findOne.mockResolvedValue({
      id: 'project-1',
      deletedAt: new Date(),
    });
    await expect(service.assertCanView(lead, 'project-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects making a normal user a project lead', async () => {
    const { service, gatewayUsers } = buildService();
    gatewayUsers.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@demo.local',
      name: 'User',
      role: 'user',
    });
    await expect(
      service.addMember(lead, 'project-1', {
        email: 'user@demo.local',
        role: 'lead',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns 409 when the user is already a member', async () => {
    const { service, gatewayUsers, members } = buildService();
    gatewayUsers.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@demo.local',
      name: 'User',
      role: 'user',
    });
    members.findOne
      .mockResolvedValueOnce({
        id: 'm-lead',
        projectId: 'project-1',
        userId: lead.id,
        role: 'lead',
      })
      .mockResolvedValueOnce({
        id: 'm-existing',
        projectId: 'project-1',
        userId: 'user-1',
        role: 'member',
      });

    await expect(
      service.addMember(lead, 'project-1', { email: 'user@demo.local' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('clears assignees when removing a member', async () => {
    const { service, members, manager } = buildService();
    members.findOne
      .mockResolvedValueOnce({
        id: 'm-lead',
        projectId: 'project-1',
        userId: lead.id,
        role: 'lead',
      })
      .mockResolvedValueOnce({
        id: 'm2',
        projectId: 'project-1',
        userId: 'user-1',
        role: 'member',
      });
    members.count.mockResolvedValue(2);

    await service.removeMember(lead, 'project-1', 'user-1');
    expect(manager.update).toHaveBeenCalledWith(
      expect.anything(),
      { projectId: 'project-1', assigneeId: 'user-1' },
      { assigneeId: null },
    );
    expect(manager.remove).toHaveBeenCalled();
  });
});
