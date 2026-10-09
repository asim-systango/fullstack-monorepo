import { BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService.removeMember', () => {
  it('blocks removing the last project_lead', async () => {
    const members = {
      findOne: () =>
        Promise.resolve({
          id: 'm1',
          projectId: 'p1',
          userId: 'u2',
          projectRole: 'project_lead',
        }),
      count: () => Promise.resolve(1), // only one lead left
      delete: jest.fn(),
    };
    const svc = new ProjectsService({} as never, members as never, {} as never);
    await expect(svc.removeMember('p1', 'u2')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(members.delete).not.toHaveBeenCalled();
  });
});
