import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth/jwt-user';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { MembershipService } from './membership.service';
import { AddMemberDto, CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>,
    private readonly membership: MembershipService,
  ) {}

  async create(dto: CreateProjectDto, user: JwtUser): Promise<Project> {
    const project = await this.projects.save(this.projects.create(dto));
    await this.members.save(
      this.members.create({
        projectId: project.id,
        userId: user.id,
        projectRole: 'project_lead',
      }),
    );
    return project;
  }

  async list(user: JwtUser): Promise<Project[]> {
    if (user.role === 'admin') return this.projects.find();
    return this.projects
      .createQueryBuilder('p')
      .innerJoin(ProjectMember, 'pm', 'pm.project_id = p.id AND pm.user_id = :uid', {
        uid: user.id,
      })
      .getMany();
  }

  async findOne(id: string, user: JwtUser): Promise<Project> {
    await this.membership.assertMember(id, user);
    const project = await this.projects.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, user: JwtUser): Promise<Project> {
    await this.membership.assertLead(id, user);
    await this.projects.update(id, dto);
    return this.projects.findOneOrFail({ where: { id } });
  }

  async remove(id: string, user: JwtUser): Promise<void> {
    await this.membership.assertLead(id, user);
    await this.projects.softDelete(id);
  }

  async listMembers(id: string, user: JwtUser): Promise<ProjectMember[]> {
    await this.membership.assertMember(id, user);
    return this.members.find({ where: { projectId: id } });
  }

  async addMember(id: string, dto: AddMemberDto, user: JwtUser): Promise<ProjectMember> {
    await this.membership.assertLead(id, user);
    return this.members.save(this.members.create({ projectId: id, ...dto }));
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const row = await this.members.findOne({ where: { projectId, userId } });
    if (!row) throw new NotFoundException('Member not found');
    if (row.projectRole === 'project_lead') {
      const leads = await this.members.count({
        where: { projectId, projectRole: 'project_lead' },
      });
      if (leads <= 1)
        throw new BadRequestException('Cannot remove the last project lead');
    }
    await this.members.delete({ projectId, userId });
  }
}
