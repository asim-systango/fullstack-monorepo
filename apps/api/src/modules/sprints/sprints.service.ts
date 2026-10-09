import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth/jwt-user';
import { MembershipService } from '../projects/membership.service';
import { Sprint } from './sprint.entity';
import { CreateSprintDto } from './dto';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint) private readonly sprints: Repository<Sprint>,
    private readonly membership: MembershipService,
  ) {}

  async list(projectId: string, user: JwtUser) {
    await this.membership.assertMember(projectId, user);
    return this.sprints.find({ where: { projectId } });
  }

  async create(projectId: string, dto: CreateSprintDto, user: JwtUser) {
    await this.membership.assertLead(projectId, user);
    return this.sprints.save(this.sprints.create({ projectId, ...dto }));
  }
}
