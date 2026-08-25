import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRecordsService } from '../personal-records';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal } from './goal.entity';

export type GoalWithProgress = Goal & {
  currentBestWeightKg: number | null;
  progressPercent: number;
};

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
    private readonly personalRecords: PersonalRecordsService,
  ) {}

  async create(userId: string, dto: CreateGoalDto): Promise<GoalWithProgress> {
    const goal = await this.goalRepo.save({
      userId,
      exerciseName: dto.exerciseName,
      targetWeightKg: dto.targetWeightKg,
      targetReps: dto.targetReps ?? null,
      targetDate: dto.targetDate ?? null,
    });
    return this.withProgress(goal);
  }

  async findAll(userId: string): Promise<GoalWithProgress[]> {
    const goals = await this.goalRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(goals.map((goal) => this.withProgress(goal)));
  }

  async findOne(userId: string, id: string): Promise<GoalWithProgress> {
    const goal = await this.findOwned(userId, id);
    return this.withProgress(goal);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateGoalDto,
  ): Promise<GoalWithProgress> {
    const goal = await this.findOwned(userId, id);
    if (dto.exerciseName !== undefined) goal.exerciseName = dto.exerciseName;
    if (dto.targetWeightKg !== undefined) goal.targetWeightKg = dto.targetWeightKg;
    if (dto.targetReps !== undefined) goal.targetReps = dto.targetReps;
    if (dto.targetDate !== undefined) goal.targetDate = dto.targetDate;
    const saved = await this.goalRepo.save(goal);
    return this.withProgress(saved);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.goalRepo.delete(id);
  }

  private async findOwned(userId: string, id: string): Promise<Goal> {
    const goal = await this.goalRepo.findOne({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException('Cannot access another user’s goal');
    }
    return goal;
  }

  private async withProgress(goal: Goal): Promise<GoalWithProgress> {
    const pr = await this.personalRecords.findOneExerciseForUser(
      goal.userId,
      goal.exerciseName,
    );
    const currentBestWeightKg =
      pr && pr.bestWeightKg !== null ? Number(pr.bestWeightKg) : null;
    const target = Number(goal.targetWeightKg);
    const progressPercent =
      currentBestWeightKg === null || target <= 0
        ? 0
        : Math.min(100, Math.round((currentBestWeightKg / target) * 100));

    return { ...goal, currentBestWeightKg, progressPercent };
  }
}
