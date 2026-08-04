import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth/jwt-user';
import { ProjectMember } from './project-member.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly members: Repository<ProjectMember>,
  ) {}

  private find(projectId: string, userId: string) {
    return this.members.findOne({ where: { projectId, userId } });
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    return (await this.find(projectId, userId)) !== null;
  }

  async assertMember(projectId: string, user: JwtUser): Promise<void> {
    if (user.role === 'admin') return;
    if (!(await this.isMember(projectId, user.id))) {
      throw new ForbiddenException('You are not a member of this project');
    }
  }

  async assertLead(projectId: string, user: JwtUser): Promise<void> {
    if (user.role === 'admin') return;
    const row = await this.find(projectId, user.id);
    if (!row || row.projectRole !== 'project_lead') {
      throw new ForbiddenException('Project lead role required');
    }
  }
}
