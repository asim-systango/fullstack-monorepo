import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Category } from './category.entity';
import { SlaPolicy, SlaPriority } from './sla-policy.entity';
import { Ticket } from '../tickets/ticket.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SlaPolicy)
    private readonly slaPolicyRepository: Repository<SlaPolicy>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['slaPolicies'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['slaPolicies'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const existing = await this.categoryRepository.findOne({
      where: [{ name: dto.name }, { slug }],
    });

    if (existing) {
      throw new BadRequestException('Category name or slug already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const category = queryRunner.manager.create(Category, {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        isActive: dto.isActive ?? true,
      });

      const savedCategory = await queryRunner.manager.save(Category, category);

      // Build SLA matrix (provided or defaults)
      const priorities = [
        SlaPriority.LOW,
        SlaPriority.MEDIUM,
        SlaPriority.HIGH,
        SlaPriority.URGENT,
      ];

      const defaultSlaMap: Record<
        SlaPriority,
        { firstResponseHours: number; resolutionHours: number }
      > = {
        [SlaPriority.LOW]: { firstResponseHours: 72, resolutionHours: 240 },
        [SlaPriority.MEDIUM]: { firstResponseHours: 24, resolutionHours: 72 },
        [SlaPriority.HIGH]: { firstResponseHours: 8, resolutionHours: 24 },
        [SlaPriority.URGENT]: { firstResponseHours: 2, resolutionHours: 8 },
      };

      const inputSlaMap = new Map<
        SlaPriority,
        { firstResponseHours: number; resolutionHours: number }
      >();

      if (dto.slaPolicies && dto.slaPolicies.length > 0) {
        for (const item of dto.slaPolicies) {
          inputSlaMap.set(item.priority, {
            firstResponseHours: item.firstResponseHours,
            resolutionHours: item.resolutionHours,
          });
        }
      }

      const slaEntities = priorities.map((p) => {
        const config = inputSlaMap.get(p) || defaultSlaMap[p];
        return queryRunner.manager.create(SlaPolicy, {
          categoryId: savedCategory.id,
          priority: p,
          firstResponseHours: config.firstResponseHours,
          resolutionHours: config.resolutionHours,
        });
      });

      await queryRunner.manager.save(SlaPolicy, slaEntities);
      await queryRunner.commitTransaction();

      return this.findOne(savedCategory.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const existingName = await this.categoryRepository.findOne({
        where: { name: dto.name },
      });
      if (existingName && existingName.id !== id) {
        throw new BadRequestException('Category name already exists');
      }
      category.name = dto.name;
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new BadRequestException('Category slug already exists');
      }
      category.slug = dto.slug;
    }

    if (dto.description !== undefined) {
      category.description = dto.description ?? null;
    }

    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    await this.categoryRepository.save(category);

    if (dto.slaPolicies && dto.slaPolicies.length > 0) {
      for (const item of dto.slaPolicies) {
        let sla = await this.slaPolicyRepository.findOne({
          where: { categoryId: id, priority: item.priority },
        });

        if (sla) {
          sla.firstResponseHours = item.firstResponseHours;
          sla.resolutionHours = item.resolutionHours;
        } else {
          sla = this.slaPolicyRepository.create({
            categoryId: id,
            priority: item.priority,
            firstResponseHours: item.firstResponseHours,
            resolutionHours: item.resolutionHours,
          });
        }
        await this.slaPolicyRepository.save(sla);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ success: boolean; id: string }> {
    await this.findOne(id);

    // Ticket existence guard: prevent deletion if active tickets exist
    const ticketCount = await this.ticketRepository.count({
      where: { categoryId: id },
    });

    if (ticketCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${ticketCount} active ticket(s) are associated with this category`,
      );
    }

    await this.categoryRepository.delete(id);
    return { success: true, id };
  }
}
