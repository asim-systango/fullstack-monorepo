import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templates: Repository<Template>,
  ) {}

  findAll(opts?: { activeOnly?: boolean }) {
    const where = opts?.activeOnly ? { isActive: true } : {};
    return this.templates.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const template = await this.templates.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const template = await this.findById(id);
    template.isActive = dto.isActive;
    return this.templates.save(template);
  }
}
