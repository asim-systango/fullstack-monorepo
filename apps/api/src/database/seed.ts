import './../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Project } from '../modules/projects/project.entity';
import { ProjectMember } from '../modules/projects/project-member.entity';
import { Issue } from '../modules/issues/issue.entity';
import { Comment } from '../modules/issues/comment.entity';
import { ActivityLog } from '../modules/issues/activity-log.entity';
import { Label } from '../modules/labels/label.entity';
import { IssueLabel } from '../modules/labels/issue-label.entity';

type SeedUser = { id: string; email: string; name: string; role: string };

async function seed() {
  await dataSource.initialize();

  // Bootstrap-only read of gateway users (runtime invite/list uses GatewayUsersClient HTTP).
  const users = (await dataSource.query(
    `SELECT id, email, name, role FROM users WHERE email = ANY($1)`,
    [['staff@demo.local', 'user@demo.local', 'admin@demo.local']],
  )) as SeedUser[];

  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));
  const staff = byEmail['staff@demo.local'];
  const member = byEmail['user@demo.local'];
  const admin = byEmail['admin@demo.local'];

  if (!staff || !member || !admin) {
    throw new Error('Gateway seed users missing — run `pnpm seed` first');
  }

  const projectRepo = dataSource.getRepository(Project);
  const existing = await projectRepo.count();
  if (existing > 0) {
    console.log('Domain seed skipped — projects already present');
    await dataSource.destroy();
    return;
  }

  await dataSource.transaction(async (manager) => {
    const p1 = await manager.save(
      manager.create(Project, {
        name: 'TaskFlow Core',
        key: 'TF',
        createdByUserId: staff.id,
      }),
    );
    const p2 = await manager.save(
      manager.create(Project, {
        name: 'Marketing Site',
        key: 'MKT',
        createdByUserId: staff.id,
      }),
    );

    await manager.save([
      manager.create(ProjectMember, {
        projectId: p1.id,
        userId: staff.id,
        role: 'lead',
        name: staff.name,
        email: staff.email,
      }),
      manager.create(ProjectMember, {
        projectId: p1.id,
        userId: member.id,
        role: 'member',
        name: member.name,
        email: member.email,
      }),
      manager.create(ProjectMember, {
        projectId: p1.id,
        userId: admin.id,
        role: 'member',
        name: admin.name,
        email: admin.email,
      }),
      manager.create(ProjectMember, {
        projectId: p2.id,
        userId: staff.id,
        role: 'lead',
        name: staff.name,
        email: staff.email,
      }),
    ]);

    const bug = await manager.save(
      manager.create(Label, { projectId: p1.id, name: 'bug', color: '#ef4444' }),
    );
    const feature = await manager.save(
      manager.create(Label, {
        projectId: p1.id,
        name: 'feature',
        color: '#22c55e',
      }),
    );
    const chore = await manager.save(
      manager.create(Label, { projectId: p1.id, name: 'chore', color: '#64748b' }),
    );

    const issueAuth = await manager.save(
      manager.create(Issue, {
        projectId: p1.id,
        title: 'Set up auth shell',
        description: 'Cookie JWT via gateway',
        status: 'done',
        assigneeId: staff.id,
        reporterId: staff.id,
      }),
    );
    const issueApi = await manager.save(
      manager.create(Issue, {
        projectId: p1.id,
        title: 'Build projects API',
        description: 'CRUD + membership',
        status: 'in_progress',
        assigneeId: staff.id,
        reporterId: staff.id,
      }),
    );
    const issueBoard = await manager.save(
      manager.create(Issue, {
        projectId: p1.id,
        title: 'Issue board UI',
        description: 'Columns by status',
        status: 'todo',
        assigneeId: member.id,
        reporterId: staff.id,
      }),
    );
    const issueSoftDelete = await manager.save(
      manager.create(Issue, {
        projectId: p1.id,
        title: 'Soft-delete issues',
        description: 'deletedAt + list filter',
        status: 'todo',
        assigneeId: member.id,
        reporterId: member.id,
      }),
    );
    const issueWs = await manager.save(
      manager.create(Issue, {
        projectId: p1.id,
        title: 'WebSocket live updates',
        description: 'Stretch',
        status: 'todo',
        assigneeId: null,
        reporterId: staff.id,
      }),
    );
    await manager.save(
      manager.create(Issue, {
        projectId: p2.id,
        title: 'Landing copy refresh',
        description: 'Marketing project issue',
        status: 'in_progress',
        assigneeId: staff.id,
        reporterId: staff.id,
      }),
    );

    await manager.save([
      manager.create(IssueLabel, { issueId: issueApi.id, labelId: feature.id }),
      manager.create(IssueLabel, { issueId: issueBoard.id, labelId: feature.id }),
      manager.create(IssueLabel, {
        issueId: issueSoftDelete.id,
        labelId: bug.id,
      }),
      manager.create(IssueLabel, { issueId: issueWs.id, labelId: chore.id }),
    ]);

    await manager.save([
      manager.create(Comment, {
        issueId: issueApi.id,
        authorUserId: staff.id,
        body: 'Membership checks land first.',
      }),
      manager.create(Comment, {
        issueId: issueApi.id,
        authorUserId: member.id,
        body: 'I can start the board once status API is ready.',
      }),
      manager.create(Comment, {
        issueId: issueBoard.id,
        authorUserId: member.id,
        body: 'Planning three columns: todo / in progress / done.',
      }),
      manager.create(Comment, {
        issueId: issueAuth.id,
        authorUserId: staff.id,
        body: 'Auth shell is done — closing this out.',
      }),
    ]);

    await manager.save([
      manager.create(ActivityLog, {
        issueId: issueAuth.id,
        actorUserId: staff.id,
        type: 'status_changed',
        message: 'Status changed from in_progress to done',
      }),
      manager.create(ActivityLog, {
        issueId: issueApi.id,
        actorUserId: staff.id,
        type: 'status_changed',
        message: 'Status changed from todo to in_progress',
      }),
    ]);
  });

  console.log('Domain seed complete — TaskFlow demo data loaded');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
