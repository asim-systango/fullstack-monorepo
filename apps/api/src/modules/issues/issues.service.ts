import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { assertStatusTransition } from './issue-status';
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
      .innerJoin('projects', 'project', 'project.id = issue.project_id')
      .where('issue.deletedAt IS NULL')
      .andWhere('project.deleted_at IS NULL');

    if (query.projectId) {
      qb.andWhere('issue.projectId = :projectId', { projectId: query.projectId });
    } else {
      if (user.role !== 'admin') {
        qb.andWhere(
          `issue.projectId IN (SELECT pm.project_id FROM project_members pm WHERE pm.user_id = :uid)`,
          { uid: user.id },
        );
      }
    }

    if (query.status) {
      qb.andWhere('issue.status = :status', { status: query.status });
    }
    if (query.assigneeId) {
      qb.andWhere('issue.assigneeId = :assigneeId', { assigneeId: query.assigneeId });
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

    qb.orderBy('issue.updatedAt', 'DESC')
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
    if (dto.assigneeId !== undefined) {
      await this.projectsService.assertAssigneeInProject(issue.projectId, dto.assigneeId);
    }

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
    await this.requireMutableIssue(user, issueId);

    let projectId = '';
    let emittedStatus: IssueStatus | undefined;

    await this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Issue, {
        where: { id: issueId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked || locked.deletedAt) {
        throw new NotFoundException('Issue not found');
      }

      try {
        assertStatusTransition(locked.status, dto.status);
      } catch (err) {
        if (err && typeof err === 'object' && 'isStatusError' in err) {
          throw new BadRequestException(
            `Invalid status transition from ${locked.status} to ${dto.status}`,
          );
        }
        throw err;
      }

      if (locked.status === dto.status) {
        projectId = locked.projectId;
        return;
      }

      const from = locked.status;
      await manager.update(Issue, { id: issueId }, { status: dto.status });
      await manager.save(
        manager.create(ActivityLog, {
          issueId,
          actorUserId: user.id,
          type: 'status_changed',
          message: `Status changed from ${from} to ${dto.status}`,
        }),
      );
      projectId = locked.projectId;
      emittedStatus = dto.status;
    });

    const full = await this.getOne(user, issueId);
    if (emittedStatus) {
      this.issuesEvents.emitIssueUpdated({
        issueId,
        projectId,
        type: 'status_changed',
        status: emittedStatus,
      });
    }
    return full;
  }

  async softDelete(user: JwtUser, issueId: string) {
    const issue = await this.requireMutableIssue(user, issueId);
    const membership = await this.projectsService.assertMember(user.id, issue.projectId);
    const allowed =
      membership.role === 'lead' || issue.reporterId === user.id || user.role === 'admin';
    if (!allowed) {
      throw new ForbiddenException(
        'Only the project lead or the reporter can delete this issue',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.softRemove(issue);
      await manager.save(
        manager.create(ActivityLog, {
          issueId: issue.id,
          actorUserId: user.id,
          type: 'deleted',
          message: 'Issue deleted',
        }),
      );
    });

    this.issuesEvents.emitIssueUpdated({
      issueId,
      projectId: issue.projectId,
      type: 'deleted',
    });
    return { id: issueId };
  }

  async addComment(user: JwtUser, issueId: string, dto: CreateCommentDto) {
    const issue = await this.requireMutableIssue(user, issueId);
    const comment = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(Comment, {
          issueId: issue.id,
          authorUserId: user.id,
          body: dto.body.trim(),
        }),
      );
      await manager.save(
        manager.create(ActivityLog, {
          issueId: issue.id,
          actorUserId: user.id,
          type: 'commented',
          message: 'Comment added',
        }),
      );
      return saved;
    });

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
      .where('l.projectId = :projectId', { projectId })
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
