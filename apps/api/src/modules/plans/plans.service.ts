import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanDay } from './plan-day.entity';
import { WorkoutPlan } from './workout-plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(WorkoutPlan) private readonly planRepo: Repository<WorkoutPlan>,
  ) {}

  async create(userId: string, dto: CreatePlanDto): Promise<WorkoutPlan> {
    return this.dataSource.transaction(async (manager) => {
      const plan = await manager.save(WorkoutPlan, {
        userId,
        title: dto.title,
        notes: dto.notes ?? null,
      });

      for (const day of dto.days) {
        await manager.save(PlanDay, {
          planId: plan.id,
          dayLabel: day.dayLabel,
          order: day.order,
          exercises: day.exercises,
        });
      }

      return this.findOwned(userId, plan.id, manager);
    });
  }

  async findAll(userId: string): Promise<WorkoutPlan[]> {
    return this.planRepo.find({
      where: { userId },
      relations: { days: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<WorkoutPlan> {
    return this.findOwned(userId, id);
  }

  async update(userId: string, id: string, dto: UpdatePlanDto): Promise<WorkoutPlan> {
    await this.findOwned(userId, id);

    return this.dataSource.transaction(async (manager) => {
      if (dto.title !== undefined || dto.notes !== undefined) {
        await manager.update(WorkoutPlan, id, {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        });
      }

      if (dto.days !== undefined) {
        await manager.delete(PlanDay, { planId: id });
        for (const day of dto.days) {
          await manager.save(PlanDay, {
            planId: id,
            dayLabel: day.dayLabel,
            order: day.order,
            exercises: day.exercises,
          });
        }
      }

      return this.findOwned(userId, id, manager);
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.planRepo.delete(id);
  }

  private async findOwned(
    userId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<WorkoutPlan> {
    const repo = manager ? manager.getRepository(WorkoutPlan) : this.planRepo;
    const plan = await repo.findOne({
      where: { id },
      relations: { days: true },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    if (plan.userId !== userId) {
      throw new ForbiddenException('Cannot access another user’s plan');
    }
    return plan;
  }
}
