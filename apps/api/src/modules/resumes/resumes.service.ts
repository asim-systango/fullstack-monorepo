import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TemplatesService } from '../templates/templates.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ListResumesQueryDto } from './dto/list-resumes-query.dto';
import { SectionDraftDto, UpdateResumeDto } from './dto/update-resume.dto';
import { Resume } from './resume.entity';
import { Section } from './section.entity';
import { SectionItem } from './section-item.entity';

const RESUME_NOT_FOUND = 'Resume not found';

function stripEdgeHyphens(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === '-') start += 1;
  while (end > start && value[end - 1] === '-') end -= 1;
  return value.slice(start, end);
}

function slugifyName(fullName: string): string {
  const base = stripEdgeHyphens(
    fullName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-'),
  );
  return base || 'resume';
}

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumes: Repository<Resume>,
    private readonly templates: TemplatesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(ownerId: string, dto: CreateResumeDto) {
    const template = await this.templates.findById(dto.templateId);
    if (!template.isActive) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: 'Cannot create a resume with an inactive template',
        details: [{ field: 'templateId', message: 'Template is inactive' }],
      });
    }

    const resume = this.resumes.create({
      ownerId,
      title: dto.title.trim(),
      templateId: template.id,
      status: 'draft',
      slug: null,
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    });
    return this.resumes.save(resume);
  }

  async listOwn(ownerId: string, query: ListResumesQueryDto) {
    return this.list({ ...query, ownerId });
  }

  async listAll(query: ListResumesQueryDto) {
    const result = await this.list(query);
    const names = await this.loadOwnerNames([
      ...new Set(result.items.map((item) => item.ownerId)),
    ]);
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        ownerName: names.get(item.ownerId) ?? null,
      })),
    };
  }

  private async list(query: ListResumesQueryDto & { ownerId?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.resumes
      .createQueryBuilder('resume')
      .leftJoinAndSelect('resume.template', 'template')
      .orderBy('resume.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.ownerId) {
      qb.andWhere('resume.ownerId = :ownerId', { ownerId: query.ownerId });
    }
    if (query.status) {
      qb.andWhere('resume.status = :status', { status: query.status });
    }
    if (query.templateId) {
      qb.andWhere('resume.templateId = :templateId', {
        templateId: query.templateId,
      });
    }
    if (query.q?.trim()) {
      qb.andWhere('resume.title ILIKE :q', { q: `%${query.q.trim()}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /** Gateway users share this database; domain API does not own a User entity. */
  private async loadOwnerNames(ownerIds: string[]): Promise<Map<string, string>> {
    if (ownerIds.length === 0) return new Map();
    const placeholders = ownerIds.map((_, index) => `$${index + 1}`).join(', ');
    const rows: Array<{ id: string; name: string }> = await this.dataSource.query(
      `SELECT id, name FROM users WHERE id IN (${placeholders})`,
      ownerIds,
    );
    return new Map(rows.map((row) => [row.id, row.name]));
  }

  async findOwned(id: string, ownerId: string) {
    const resume = await this.resumes.findOne({
      where: { id, ownerId },
      relations: {
        template: true,
        sections: { items: true },
      },
    });
    if (!resume) throw new NotFoundException(RESUME_NOT_FOUND);
    this.sortNested(resume);
    return resume;
  }

  async findPublishedBySlug(slug: string) {
    const resume = await this.resumes.findOne({
      where: { slug, status: 'published' },
      relations: {
        template: true,
        sections: { items: true },
      },
    });
    if (!resume) {
      throw new NotFoundException('This resume is not available');
    }
    this.sortNested(resume);
    return resume;
  }

  private sortNested(resume: Resume) {
    resume.sections = (resume.sections ?? []).sort((a, b) => a.position - b.position);
    for (const section of resume.sections) {
      section.items = (section.items ?? []).sort((a, b) => a.position - b.position);
    }
  }

  async update(id: string, ownerId: string, dto: UpdateResumeDto) {
    return this.dataSource.transaction(async (manager) => {
      const resumeRepo = manager.getRepository(Resume);
      const sectionRepo = manager.getRepository(Section);
      const itemRepo = manager.getRepository(SectionItem);

      const resume = await resumeRepo.findOne({
        where: { id, ownerId },
        relations: { sections: { items: true } },
      });
      if (!resume) throw new NotFoundException(RESUME_NOT_FOUND);

      if (dto.templateId && dto.templateId !== resume.templateId) {
        const template = await this.templates.findById(dto.templateId);
        if (!template.isActive) {
          throw new BadRequestException({
            error: 'Bad Request',
            message: 'Cannot switch to an inactive template',
            details: [{ field: 'templateId', message: 'Template is inactive' }],
          });
        }
        resume.templateId = template.id;
      }

      if (dto.title !== undefined) resume.title = dto.title.trim();
      if (dto.fullName !== undefined) resume.fullName = dto.fullName.trim();
      if (dto.email !== undefined) resume.email = dto.email.trim();
      if (dto.phone !== undefined) resume.phone = dto.phone.trim();
      if (dto.location !== undefined) resume.location = dto.location.trim();
      if (dto.summary !== undefined) resume.summary = dto.summary;

      await resumeRepo.save(resume);

      if (dto.sections !== undefined) {
        await sectionRepo.delete({ resumeId: resume.id });
        await this.insertSections(sectionRepo, itemRepo, resume.id, dto.sections);
      }

      const updated = await resumeRepo.findOne({
        where: { id: resume.id },
        relations: {
          template: true,
          sections: { items: true },
        },
      });
      if (!updated) throw new NotFoundException(RESUME_NOT_FOUND);
      this.sortNested(updated);
      return updated;
    });
  }

  private async insertSections(
    sectionRepo: Repository<Section>,
    itemRepo: Repository<SectionItem>,
    resumeId: string,
    sections: SectionDraftDto[],
  ) {
    for (const [index, draft] of sections.entries()) {
      const section = await sectionRepo.save(
        sectionRepo.create({
          resumeId,
          type: draft.type,
          title: draft.title.trim(),
          position: draft.position ?? index,
        }),
      );

      const items = draft.items ?? [];
      for (const [itemIndex, itemDraft] of items.entries()) {
        await itemRepo.save(
          itemRepo.create({
            sectionId: section.id,
            heading: itemDraft.heading?.trim() ?? '',
            subheading: itemDraft.subheading?.trim() ?? '',
            startDate: itemDraft.startDate?.trim() ?? '',
            endDate: itemDraft.endDate?.trim() ?? '',
            description: itemDraft.description ?? '',
            position: itemDraft.position ?? itemIndex,
          }),
        );
      }
    }
  }

  collectPublishGaps(resume: Resume): Array<{ field: string; message: string }> {
    const details: Array<{ field: string; message: string }> = [];
    if (!resume.fullName?.trim()) {
      details.push({ field: 'fullName', message: 'Full name is required' });
    }
    if (!resume.email?.trim()) {
      details.push({ field: 'email', message: 'Email is required' });
    }

    const sections = resume.sections ?? [];
    const hasExpOrEduItem = sections.some(
      (section) =>
        (section.type === 'experience' || section.type === 'education') &&
        (section.items ?? []).length > 0,
    );
    if (!hasExpOrEduItem) {
      details.push({
        field: 'sections',
        message: 'At least one Experience or Education item is required to publish',
      });
    }
    return details;
  }

  async publish(id: string, ownerId: string) {
    const resume = await this.findOwned(id, ownerId);
    const details = this.collectPublishGaps(resume);
    if (details.length > 0) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: details.map((d) => d.message),
        details,
      });
    }

    const base = slugifyName(resume.fullName);
    resume.slug = await this.allocateSlug(base, resume.id);
    resume.status = 'published';
    await this.resumes.save(resume);
    return this.findOwned(id, ownerId);
  }

  async unpublish(id: string, ownerId: string) {
    const resume = await this.findOwned(id, ownerId);
    resume.status = 'draft';
    resume.slug = null;
    await this.resumes.save(resume);
    return this.findOwned(id, ownerId);
  }

  private async allocateSlug(base: string, excludeId: string): Promise<string> {
    let candidate = base;
    let n = 2;
    for (;;) {
      const existing = await this.resumes.findOne({
        where: { slug: candidate },
        withDeleted: true,
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${n}`;
      n += 1;
    }
  }

  async duplicate(id: string, ownerId: string) {
    const source = await this.findOwned(id, ownerId);

    return this.dataSource.transaction(async (manager) => {
      const resumeRepo = manager.getRepository(Resume);
      const sectionRepo = manager.getRepository(Section);
      const itemRepo = manager.getRepository(SectionItem);

      const copy = await resumeRepo.save(
        resumeRepo.create({
          ownerId,
          title: `${source.title} (copy)`,
          templateId: source.templateId,
          fullName: source.fullName,
          email: source.email,
          phone: source.phone,
          location: source.location,
          summary: source.summary,
          status: 'draft',
          slug: null,
        }),
      );

      for (const section of source.sections ?? []) {
        const newSection = await sectionRepo.save(
          sectionRepo.create({
            resumeId: copy.id,
            type: section.type,
            title: section.title,
            position: section.position,
          }),
        );
        for (const item of section.items ?? []) {
          await itemRepo.save(
            itemRepo.create({
              sectionId: newSection.id,
              heading: item.heading,
              subheading: item.subheading,
              startDate: item.startDate,
              endDate: item.endDate,
              description: item.description,
              position: item.position,
            }),
          );
        }
      }

      const result = await resumeRepo.findOne({
        where: { id: copy.id },
        relations: {
          template: true,
          sections: { items: true },
        },
      });
      if (!result) throw new NotFoundException(RESUME_NOT_FOUND);
      this.sortNested(result);
      return result;
    });
  }

  async softDelete(id: string, ownerId: string) {
    const resume = await this.resumes.findOne({ where: { id, ownerId } });
    if (!resume) throw new NotFoundException(RESUME_NOT_FOUND);
    await this.resumes.softRemove(resume);
    return { ok: true };
  }
}
