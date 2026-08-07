import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { JwtUser } from '../../common/auth/jwt-user';
import { MembershipService } from '../projects/membership.service';
import { Issue } from './issue.entity';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';
import { IssueLabel } from '../labels/issue-label.entity';
import { assertTransition } from './status-machine';
import { ChangeStatusDto, CreateCommentDto, CreateIssueDto, IssueFilterDto } from './dto';

const PAGE_SIZE = 20;

@Injectable()
export class IssuesService {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly membership: MembershipService,
  ) {}

  async create(projectId: string, dto: CreateIssueDto, user: JwtUser): Promise<Issue> {
    await this.membership.assertMember(projectId, user);
    if (dto.assigneeId && !(await this.membership.isMember(projectId, dto.assigneeId))) {
      throw new BadRequestException('Assignee must be a project member');
    }
    return this.db.transaction(async (m) => {
      const issue = await m.save(
        m.create(Issue, {
          projectId,
          title: dto.title,
          description: dto.description ?? '',
          assigneeId: dto.assigneeId ?? null,
          status: 'todo',
        }),
      );
      for (const labelId of dto.labelIds ?? []) {
        await m.save(m.create(IssueLabel, { issueId: issue.id, labelId }));
      }
      await m.save(
        m.create(ActivityLog, {
          issueId: issue.id,
          userId: user.id,
          fromStatus: null,
          toStatus: 'todo',
        }),
      );
      return issue;
    });
  }

  async list(projectId: string, filter: IssueFilterDto, user: JwtUser): Promise<Issue[]> {
    await this.membership.assertMember(projectId, user);
    const page = Math.max(1, Number(filter.page ?? '1'));
    const qb = this.db
      .getRepository(Issue)
      .createQueryBuilder('i')
      .where('i.project_id = :projectId', { projectId });
    if (filter.status) qb.andWhere('i.status = :status', { status: filter.status });
    if (filter.assigneeId)
      qb.andWhere('i.assignee_id = :assigneeId', { assigneeId: filter.assigneeId });
    if (filter.labelId) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM issue_labels il WHERE il.issue_id = i.id AND il.label_id = :labelId)',
        { labelId: filter.labelId },
      );
    }
    return qb
      .orderBy('i.created_at', 'DESC')
      .skip((page - 1) * PAGE_SIZE)
      .take(PAGE_SIZE)
      .getMany();
  }

  async findOne(id: string, user: JwtUser) {
    const issue = await this.db.getRepository(Issue).findOne({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');
    await this.membership.assertMember(issue.projectId, user);
    const comments = await this.db
      .getRepository(Comment)
      .find({ where: { issueId: id }, order: { createdAt: 'ASC' } });
    const activity = await this.db
      .getRepository(ActivityLog)
      .find({ where: { issueId: id }, order: { createdAt: 'ASC' } });
    const labels = await this.db
      .getRepository(IssueLabel)
      .find({ where: { issueId: id } });
    return { ...issue, comments, activity, labelIds: labels.map((l) => l.labelId) };
  }

  async changeStatus(id: string, dto: ChangeStatusDto, user: JwtUser): Promise<Issue> {
    const issue = await this.db.getRepository(Issue).findOne({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');
    await this.membership.assertMember(issue.projectId, user);
    assertTransition(issue.status, dto.status);
    return this.db.transaction(async (m) => {
      await m.update(Issue, id, { status: dto.status });
      await m.save(
        m.create(ActivityLog, {
          issueId: id,
          userId: user.id,
          fromStatus: issue.status,
          toStatus: dto.status,
        }),
      );
      return m.findOneOrFail(Issue, { where: { id } });
    });
  }

  async remove(id: string, user: JwtUser): Promise<void> {
    const issue = await this.db.getRepository(Issue).findOne({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');
    await this.membership.assertLead(issue.projectId, user);
    await this.db.getRepository(Issue).softDelete(id);
  }

  async addComment(id: string, dto: CreateCommentDto, user: JwtUser): Promise<Comment> {
    const issue = await this.db.getRepository(Issue).findOne({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found'); // soft-deleted → excluded → 404
    await this.membership.assertMember(issue.projectId, user);
    return this.db
      .getRepository(Comment)
      .save(
        this.db
          .getRepository(Comment)
          .create({ issueId: id, authorId: user.id, body: dto.body }),
      );
  }
}
