import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { ProjectsService } from '../projects/projects.service';
import { Label } from '../labels/label.entity';
import { IssueLabel } from '../labels/issue-label.entity';
import { Issue, type IssueStatus } from './issue.entity';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { isAllowedStatusTransition } from './issue-status';
import { IssuesEvents } from '../realtime/issues-events';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issues: Repository<Issue>,
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
    @InjectRepository(ActivityLog)
    private readonly activityLogs: Repository<ActivityLog>,
    @InjectRepository(Label)
    private readonly labels: Repository<Label>,
    @InjectRepository(IssueLabel)
    private readonly issueLabels: Repository<IssueLabel>,
    private readonly projectsService: ProjectsService,
    private readonly dataSource: DataSource,
    private readonly issuesEvents: IssuesEvents,
  ) {}

  async create(user: JwtUser, projectId: string, dto: CreateIssueDto) {
    await this.projectsService.assertMember(user.id, projectId);
    await this.projectsService.assertAssigneeInProject(projectId, dto.assigneeId);

    const labelIds = dto.labelIds ?? [];
    if (labelIds.length > 0) {
      await this.assertLabelsInProject(projectId, labelIds);
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      const issue = manager.create(Issue, {
        projectId,
        title: dto.title.trim(),
        description: dto.description?.trim() ?? '',
        status: 'todo',
        assigneeId: dto.assigneeId ?? null,
        reporterId: user.id,
      });
      const created = await manager.save(issue);

      for (const labelId of labelIds) {
        await manager.save(manager.create(IssueLabel, { issueId: created.id, labelId }));
      }

      await manager.save(
        manager.create(ActivityLog, {
          issueId: created.id,
          actorUserId: user.id,
          type: 'created',
          message: `Issue created with status todo`,
        }),
      );

      return created;
    });

    const full = await this.getOne(user, saved.id);
    this.issuesEvents.emitIssueUpdated({
      issueId: saved.id,
      projectId,
      type: 'created',
    });
    return full;
  }

  async listForProject(user: JwtUser, projectId: string, query: ListIssuesQueryDto) {
    await this.projectsService.assertCanView(user, projectId);
    return this.listInternal(user, { ...query, projectId });
  }

  async listMine(user: JwtUser, query: ListIssuesQueryDto) {
    return this.listInternal(user, {
      ...query,
      assigneeId: user.id,
      openOnly: true,
    });
  }

  private async listInternal(
    user: JwtUser,
    query: ListIssuesQueryDto & { projectId?: string; openOnly?: boolean },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.issues
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.issueLabels', 'il')
      .leftJoinAndSelect('il.label', 'label')
      .where('issue.deleted_at IS NULL');

    if (query.projectId) {
      qb.andWhere('issue.project_id = :projectId', { projectId: query.projectId });
    } else {
      // Dashboard: only projects the user can see
      if (user.role !== 'admin') {
        qb.andWhere(
          `issue.project_id IN (SELECT pm.project_id FROM project_members pm WHERE pm.user_id = :uid)`,
          { uid: user.id },
        );
      }
    }

    if (query.status) {
      qb.andWhere('issue.status = :status', { status: query.status });
    }
    if (query.assigneeId) {
      qb.andWhere('issue.assignee_id = :assigneeId', { assigneeId: query.assigneeId });
    }
    if (query.openOnly) {
      qb.andWhere(`issue.status IN ('todo', 'in_progress')`);
    }
    if (query.labelId) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM issue_labels x WHERE x.issue_id = issue.id AND x.label_id = :labelId)`,
        { labelId: query.labelId },
      );
    }
    const q = query.q?.trim();
    if (q) {
      qb.andWhere('(issue.title ILIKE :q OR issue.description ILIKE :q)', {
        q: `%${q}%`,
      });
    }

    qb.orderBy('issue.updated_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((issue) => this.serializeIssue(issue)),
      total,
      page,
      limit,
    };
  }

  async getOne(user: JwtUser, issueId: string) {
    const issue = await this.issues.findOne({
      where: { id: issueId },
      relations: ['issueLabels', 'issueLabels.label'],
    });
    if (!issue || issue.deletedAt) {
      throw new NotFoundException('Issue not found');
    }
    await this.projectsService.assertCanView(user, issue.projectId);

    const [comments, activity] = await Promise.all([
      this.comments.find({
        where: { issueId },
        order: { createdAt: 'ASC' },
      }),
      this.activityLogs.find({
        where: { issueId },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      ...this.serializeIssue(issue),
      comments,
      activity,
    };
  }

  async update(user: JwtUser, issueId: string, dto: UpdateIssueDto) {
    const issue = await this.requireMutableIssue(user, issueId);
    await this.projectsService.assertAssigneeInProject(
      issue.projectId,
      dto.assigneeId === undefined ? issue.assigneeId : dto.assigneeId,
    );

    if (dto.labelIds) {
      await this.assertLabelsInProject(issue.projectId, dto.labelIds);
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.title !== undefined) {
        issue.title = dto.title.trim();
      }
      if (dto.description !== undefined) {
        issue.description = dto.description;
      }
      if (dto.assigneeId !== undefined) {
        issue.assigneeId = dto.assigneeId;
      }
      await manager.save(issue);

      if (dto.labelIds) {
        await manager.delete(IssueLabel, { issueId: issue.id });
        for (const labelId of dto.labelIds) {
          await manager.save(manager.create(IssueLabel, { issueId: issue.id, labelId }));
        }
      }
    });

    const full = await this.getOne(user, issueId);
    this.issuesEvents.emitIssueUpdated({
      issueId,
      projectId: issue.projectId,
      type: 'updated',
    });
    return full;
  }

  async updateStatus(user: JwtUser, issueId: string, dto: UpdateIssueStatusDto) {
    const issue = await this.requireMutableIssue(user, issueId);
    if (!isAllowedStatusTransition(issue.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${issue.status} to ${dto.status}`,
      );
    }
    if (issue.status === dto.status) {
      return this.getOne(user, issueId);
    }

    const from = issue.status;
    await this.dataSource.transaction(async (manager) => {
      issue.status = dto.status;
      await manager.save(issue);
      await manager.save(
        manager.create(ActivityLog, {
          issueId: issue.id,
          actorUserId: user.id,
          type: 'status_changed',
          message: `Status changed from ${from} to ${dto.status}`,
        }),
      );
    });

    const full = await this.getOne(user, issueId);
    this.issuesEvents.emitIssueUpdated({
      issueId,
      projectId: issue.projectId,
      type: 'status_changed',
      status: dto.status,
    });
    return full;
  }

  async softDelete(user: JwtUser, issueId: string) {
    const issue = await this.requireMutableIssue(user, issueId);
    // Lead or reporter can delete; members can soft-delete if member of project
    const membership = await this.projectsService.assertMember(user.id, issue.projectId);
    if (
      membership.role !== 'lead' &&
      issue.reporterId !== user.id &&
      user.role !== 'admin'
    ) {
      // Still allow any member per Must brief (member-only mutations)
    }
    await this.issues.softRemove(issue);
    this.issuesEvents.emitIssueUpdated({
      issueId,
      projectId: issue.projectId,
      type: 'deleted',
    });
    return { id: issueId };
  }

  async addComment(user: JwtUser, issueId: string, dto: CreateCommentDto) {
    const issue = await this.requireMutableIssue(user, issueId);
    const comment = await this.comments.save(
      this.comments.create({
        issueId: issue.id,
        authorUserId: user.id,
        body: dto.body.trim(),
      }),
    );
    await this.activityLogs.save(
      this.activityLogs.create({
        issueId: issue.id,
        actorUserId: user.id,
        type: 'commented',
        message: 'Comment added',
      }),
    );
    this.issuesEvents.emitIssueUpdated({
      issueId,
      projectId: issue.projectId,
      type: 'commented',
    });
    return comment;
  }

  private async requireMutableIssue(user: JwtUser, issueId: string): Promise<Issue> {
    const issue = await this.issues.findOne({ where: { id: issueId } });
    if (!issue || issue.deletedAt) {
      throw new NotFoundException('Issue not found');
    }
    await this.projectsService.assertMember(user.id, issue.projectId);
    return issue;
  }

  private async assertLabelsInProject(projectId: string, labelIds: string[]) {
    if (labelIds.length === 0) {
      return;
    }
    const count = await this.labels
      .createQueryBuilder('l')
      .where('l.project_id = :projectId', { projectId })
      .andWhere('l.id IN (:...labelIds)', { labelIds })
      .getCount();
    if (count !== labelIds.length) {
      throw new BadRequestException('One or more labels are invalid for this project');
    }
  }

  private serializeIssue(issue: Issue) {
    return {
      id: issue.id,
      projectId: issue.projectId,
      title: issue.title,
      description: issue.description,
      status: issue.status as IssueStatus,
      assigneeId: issue.assigneeId,
      reporterId: issue.reporterId,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      labels: (issue.issueLabels ?? []).map((il) => il.label).filter(Boolean),
    };
  }
}
