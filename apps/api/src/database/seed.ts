import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Project } from '../modules/projects/project.entity';
import { ProjectMember } from '../modules/projects/project-member.entity';
import { Label } from '../modules/labels/label.entity';
import { IssueLabel } from '../modules/labels/issue-label.entity';
import { Issue } from '../modules/issues/issue.entity';
import { Comment } from '../modules/issues/comment.entity';
import { ActivityLog } from '../modules/issues/activity-log.entity';
import { Sprint } from '../modules/sprints/sprint.entity';

async function userIdByEmail(email: string): Promise<string> {
  const rows = (await dataSource.query('SELECT id FROM users WHERE email = $1', [
    email,
  ])) as Array<{ id: string }>;
  if (!rows[0]) throw new Error(`Seed gateway users first (missing ${email})`);
  return rows[0].id;
}

async function seed() {
  await dataSource.initialize();
  const staffId = await userIdByEmail('staff@demo.local');
  const userId = await userIdByEmail('user@demo.local');

  const projects = dataSource.getRepository(Project);
  const members = dataSource.getRepository(ProjectMember);

  const blc = await projects.save(projects.create({ name: 'BlueLightCard', key: 'BLC' }));
  const mod = await projects.save(projects.create({ name: 'Modulo LABS', key: 'MOD' }));

  await members.save([
    members.create({ projectId: blc.id, userId: staffId, projectRole: 'project_lead' }),
    members.create({ projectId: blc.id, userId: userId, projectRole: 'member' }),
    members.create({ projectId: mod.id, userId: staffId, projectRole: 'project_lead' }),
    // user is intentionally NOT on MOD → demonstrates the 403 invariant
  ]);

  const labels = dataSource.getRepository(Label);
  const savedLabels = await labels.save([
    labels.create({ projectId: blc.id, name: 'bug', color: '#e5484d' }),
    labels.create({ projectId: blc.id, name: 'feature', color: '#3b82f6' }),
    labels.create({ projectId: blc.id, name: 'chore', color: '#888888' }),
  ]);
  const bug = savedLabels[0]!;
  const feature = savedLabels[1]!;

  const sprint = await dataSource.getRepository(Sprint).save(
    dataSource.getRepository(Sprint).create({
      projectId: blc.id,
      name: 'Sprint 1',
      startDate: '2026-08-01',
      endDate: '2026-08-14',
    }),
  );

  const issues = dataSource.getRepository(Issue);
  const seededIssues = await issues.save([
    issues.create({
      projectId: blc.id,
      title: 'Fix login redirect',
      status: 'in_progress',
      assigneeId: userId,
      sprintId: sprint.id,
    }),
    issues.create({
      projectId: blc.id,
      title: 'Add dark mode',
      status: 'todo',
      assigneeId: userId,
    }),
    issues.create({
      projectId: blc.id,
      title: 'Ship activity feed',
      status: 'done',
      assigneeId: staffId,
    }),
    issues.create({ projectId: blc.id, title: 'Refactor board query', status: 'todo' }),
    issues.create({
      projectId: mod.id,
      title: 'Design tokens audit',
      status: 'in_progress',
      assigneeId: staffId,
    }),
    issues.create({
      projectId: mod.id,
      title: 'Set up CI cache',
      status: 'done',
      assigneeId: staffId,
    }),
  ]);

  await dataSource.getRepository(IssueLabel).save([
    { issueId: seededIssues[0]!.id, labelId: bug.id },
    { issueId: seededIssues[1]!.id, labelId: feature.id },
  ]);

  await dataSource.getRepository(Comment).save([
    { issueId: seededIssues[0]!.id, authorId: staffId, body: 'Repro on staging.' },
    { issueId: seededIssues[0]!.id, authorId: userId, body: 'On it — cookie path bug.' },
    { issueId: seededIssues[2]!.id, authorId: staffId, body: 'Shipped!' },
    { issueId: seededIssues[4]!.id, authorId: staffId, body: 'Tokens mostly aligned.' },
  ]);

  await dataSource.getRepository(ActivityLog).save([
    {
      issueId: seededIssues[0]!.id,
      userId: staffId,
      fromStatus: 'todo',
      toStatus: 'in_progress',
    },
    {
      issueId: seededIssues[2]!.id,
      userId: staffId,
      fromStatus: 'in_progress',
      toStatus: 'done',
    },
  ]);

  console.log('Domain seed complete', { blc: blc.id, mod: mod.id });
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
