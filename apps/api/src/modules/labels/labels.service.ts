import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth/jwt-user';
import { MembershipService } from '../projects/membership.service';
import { Label } from './label.entity';
import { CreateLabelDto } from './dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label) private readonly labels: Repository<Label>,
    private readonly membership: MembershipService,
  ) {}

  async list(projectId: string, user: JwtUser) {
    await this.membership.assertMember(projectId, user);
    return this.labels.find({ where: { projectId } });
  }

  async create(projectId: string, dto: CreateLabelDto, user: JwtUser) {
    await this.membership.assertLead(projectId, user);
    return this.labels.save(
      this.labels.create({ projectId, name: dto.name, color: dto.color ?? '#888888' }),
    );
  }

  async remove(projectId: string, id: string, user: JwtUser) {
    await this.membership.assertLead(projectId, user);
    await this.labels.delete({ id, projectId });
  }
}
