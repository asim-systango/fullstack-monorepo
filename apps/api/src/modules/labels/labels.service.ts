import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { ProjectsService } from '../projects/projects.service';
import { Label } from './label.entity';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private readonly labels: Repository<Label>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(user: JwtUser, projectId: string, dto: CreateLabelDto) {
    await this.projectsService.assertMember(user.id, projectId);
    const existing = await this.labels.findOne({
      where: { projectId, name: dto.name.trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Label name already exists on this project');
    }
    return this.labels.save(
      this.labels.create({
        projectId,
        name: dto.name.trim().toLowerCase(),
        color: dto.color ?? '#64748b',
      }),
    );
  }

  async list(user: JwtUser, projectId: string) {
    await this.projectsService.assertCanView(user, projectId);
    return this.labels.find({
      where: { projectId },
      order: { name: 'ASC' },
    });
  }

  async remove(user: JwtUser, projectId: string, labelId: string) {
    await this.projectsService.assertLead(user, projectId);
    const label = await this.labels.findOne({ where: { id: labelId, projectId } });
    if (!label) {
      throw new NotFoundException('Label not found');
    }
    await this.labels.remove(label);
    return { id: labelId };
  }
}
