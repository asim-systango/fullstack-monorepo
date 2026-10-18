import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly members: Repository<ProjectMember>,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: JwtUser, dto: CreateProjectDto) {
    return this.dataSource.transaction(async (manager) => {
      const project = manager.create(Project, {
        name: dto.name.trim(),
        key: dto.key.trim().toUpperCase(),
        createdByUserId: user.id,
      });
      const saved = await manager.save(project);
      await manager.save(
        manager.create(ProjectMember, {
          projectId: saved.id,
          userId: user.id,
          role: 'lead',
        }),
      );
      return saved;
    });
  }

  async list(user: JwtUser, query: ListProjectsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const q = query.q?.trim();

    if (user.role === 'admin') {
      const where = q ? [{ name: ILike(`%${q}%`) }, { key: ILike(`%${q}%`) }] : {};
      const [items, total] = await this.projects.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total, page, limit };
    }

    const memberships = await this.members.find({ where: { userId: user.id } });
    const projectIds = memberships.map((m) => m.projectId);
    if (projectIds.length === 0) {
      return { items: [], total: 0, page, limit };
    }

    const qb = this.projects
      .createQueryBuilder('p')
      .where('p.id IN (:...projectIds)', { projectIds })
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (q) {
      qb.andWhere('(p.name ILIKE :q OR p.key ILIKE :q)', { q: `%${q}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getOne(user: JwtUser, projectId: string) {
    const project = await this.projects.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.assertCanView(user, projectId);
    const members = await this.members.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
    return { ...project, members };
  }

  async update(user: JwtUser, projectId: string, dto: UpdateProjectDto) {
    await this.assertLead(user, projectId);
    const project = await this.projects.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (dto.name !== undefined) {
      project.name = dto.name.trim();
    }
    return this.projects.save(project);
  }

  async remove(user: JwtUser, projectId: string) {
    await this.assertLead(user, projectId);
    const project = await this.projects.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.projects.remove(project);
    return { id: projectId };
  }

  async addMember(user: JwtUser, projectId: string, dto: AddMemberDto) {
    await this.assertLead(user, projectId);
    const project = await this.projects.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const rows = await this.dataSource.query<{ id: string }[]>(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [dto.email.trim().toLowerCase()],
    );
    const target = rows[0];
    if (!target) {
      throw new NotFoundException('No user found with that email');
    }

    const existing = await this.members.findOne({
      where: { projectId, userId: target.id },
    });
    if (existing) {
      throw new BadRequestException('User is already a project member');
    }

    return this.members.save(
      this.members.create({
        projectId,
        userId: target.id,
        role: dto.role ?? 'member',
      }),
    );
  }

  async removeMember(user: JwtUser, projectId: string, memberUserId: string) {
    await this.assertLead(user, projectId);
    const member = await this.members.findOne({
      where: { projectId, userId: memberUserId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'lead') {
      const leadCount = await this.members.count({
        where: { projectId, role: 'lead' },
      });
      if (leadCount <= 1) {
        throw new BadRequestException('Cannot remove the last project lead');
      }
    }

    await this.members.remove(member);
    return { projectId, userId: memberUserId };
  }

  async listMembers(user: JwtUser, projectId: string) {
    await this.assertCanView(user, projectId);
    return this.members.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async assertMember(userId: string, projectId: string): Promise<ProjectMember> {
    const member = await this.members.findOne({ where: { projectId, userId } });
    if (!member) {
      throw new ForbiddenException('Only project members can perform this action');
    }
    return member;
  }

  async assertCanView(user: JwtUser, projectId: string): Promise<void> {
    if (user.role === 'admin') {
      return;
    }
    await this.assertMember(user.id, projectId);
  }

  async assertLead(user: JwtUser, projectId: string): Promise<ProjectMember> {
    if (user.role === 'admin') {
      const existing = await this.members.findOne({
        where: { projectId, userId: user.id },
      });
      if (existing) {
        return existing;
      }
      return {
        id: 'admin',
        projectId,
        userId: user.id,
        role: 'lead',
        createdAt: new Date(),
      } as ProjectMember;
    }
    const member = await this.assertMember(user.id, projectId);
    if (member.role !== 'lead') {
      throw new ForbiddenException('Only project leads can manage this project');
    }
    return member;
  }

  async assertAssigneeInProject(
    projectId: string,
    assigneeId: string | null | undefined,
  ) {
    if (!assigneeId) {
      return;
    }
    const member = await this.members.findOne({
      where: { projectId, userId: assigneeId },
    });
    if (!member) {
      throw new BadRequestException('Assignee must be a project member');
    }
  }

  async getMembershipMap(userId: string, projectIds: string[]) {
    if (projectIds.length === 0) {
      return new Map<string, ProjectMember>();
    }
    const rows = await this.members.find({
      where: { userId, projectId: In(projectIds) },
    });
    return new Map(rows.map((r) => [r.projectId, r]));
  }
}
