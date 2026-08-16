import { BadRequestException } from '@nestjs/common';
import { IssuesService } from './issues.service';

describe('IssuesService.create', () => {
  const user = { id: 'u2', email: 's@x', role: 'staff' as const };

  it('rejects assignee who is not a project member with 400', async () => {
    const membership = {
      assertMember: () => Promise.resolve(),
      isMember: () => Promise.resolve(false),
    };
    const svc = new IssuesService({} as never, membership as never);
    await expect(
      svc.create('p1', { title: 'X', assigneeId: 'outsider' }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
