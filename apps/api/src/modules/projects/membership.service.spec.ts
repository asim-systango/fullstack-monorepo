import { ForbiddenException } from '@nestjs/common';
import { MembershipService } from './membership.service';
import type { ProjectMember } from './project-member.entity';

function repoStub(rows: Partial<ProjectMember>[]) {
  return {
    findOne: ({ where }: { where: { projectId: string; userId: string } }) =>
      Promise.resolve(
        rows.find((r) => r.projectId === where.projectId && r.userId === where.userId) ??
          null,
      ),
  } as never;
}

const member = { id: 'u1', email: 'm@x', role: 'user' as const };
const lead = { id: 'u2', email: 'l@x', role: 'staff' as const };
const admin = { id: 'u3', email: 'a@x', role: 'admin' as const };
const outsider = { id: 'u9', email: 'o@x', role: 'user' as const };

const rows = [
  { projectId: 'p1', userId: 'u1', projectRole: 'member' as const },
  { projectId: 'p1', userId: 'u2', projectRole: 'project_lead' as const },
];

describe('MembershipService', () => {
  const svc = new MembershipService(repoStub(rows));

  it('allows a member', async () => {
    await expect(svc.assertMember('p1', member)).resolves.toBeUndefined();
  });

  it('rejects an outsider with 403', async () => {
    await expect(svc.assertMember('p1', outsider)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('assertLead rejects a plain member', async () => {
    await expect(svc.assertLead('p1', member)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('assertLead allows the lead', async () => {
    await expect(svc.assertLead('p1', lead)).resolves.toBeUndefined();
  });

  it('admin bypasses membership entirely', async () => {
    await expect(svc.assertMember('p1', admin)).resolves.toBeUndefined();
    await expect(svc.assertLead('p1', admin)).resolves.toBeUndefined();
  });
});
