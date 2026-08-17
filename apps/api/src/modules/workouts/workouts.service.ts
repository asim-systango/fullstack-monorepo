import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PersonalRecordsService } from '../personal-records';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { ListWorkoutsDto } from './dto/list-workouts.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { ExerciseLog } from './exercise-log.entity';
import { Set } from './set.entity';
import { Workout } from './workout.entity';

const WORKOUT_NOT_FOUND = 'Workout not found';

export type PaginatedWorkoutMetaData = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
};

export type PaginatedWorkouts = {
  items: Workout[];
  meta: PaginatedWorkoutMetaData;
};

export type CreatedWorkout = Workout & {
  newPersonalRecords: string[];
};

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Workout) private readonly workoutRepo: Repository<Workout>,
    @InjectRepository(ExerciseLog)
    private readonly exerciseLogRepo: Repository<ExerciseLog>,

    private readonly personalRecords: PersonalRecordsService,
  ) {}

  async create(userId: string, dto: CreateWorkoutDto): Promise<CreatedWorkout> {
    return this.dataSource.transaction(async (manager) => {
      const workout = await manager.save(Workout, {
        userId,
        title: dto.title,
        performedAt: new Date(dto.performedAt),
        deletedAt: null,
      });

      const newPersonalRecords: string[] = [];

      for (const exercise of dto.exercises) {
        const log = await manager.save(ExerciseLog, {
          workoutId: workout.id,
          exerciseName: exercise.exerciseName,
        });

        for (const set of exercise.sets) {
          await manager.save(Set, {
            exerciseLogId: log.id,
            reps: set.reps,
            weightKg: set.weightKg,
          });
          const pr = await this.personalRecords.upsertIfBeaten(
            manager,
            userId,
            exercise.exerciseName,
            set,
          );
          if (pr && !newPersonalRecords.includes(exercise.exerciseName)) {
            newPersonalRecords.push(exercise.exerciseName);
          }
        }
      }

      return { ...workout, newPersonalRecords };
    });
  }

  async findAll(userId: string, query: ListWorkoutsDto): Promise<PaginatedWorkouts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const offset = (page - 1) * limit;

    // Common filters applied to every search condition
    const baseWhere: FindOptionsWhere<Workout> = {
      userId,
      deletedAt: IsNull(),
    };

    let where: FindOptionsWhere<Workout>[] = [baseWhere];

    // Filter by date range
    if (query.dateFrom && query.dateTo) {
      baseWhere.performedAt = Between(new Date(query.dateFrom), new Date(query.dateTo));
    } else if (query.dateFrom) {
      baseWhere.performedAt = MoreThanOrEqual(new Date(query.dateFrom));
    } else if (query.dateTo) {
      baseWhere.performedAt = LessThanOrEqual(new Date(query.dateTo));
    }

    // Search workout title OR exercise name
    if (query.search) {
      const exerciseLogs = await this.exerciseLogRepo.find({
        select: {
          workoutId: true,
        },
        where: {
          exerciseName: ILike(`%${query.search}%`),
        },
      });

      const workoutIds = exerciseLogs.map((log) => log.workoutId);

      where = [
        // Search by workout title
        {
          ...baseWhere,
          title: ILike(`%${query.search}%`),
        },
      ];

      // Search by exercise name
      if (workoutIds.length > 0) {
        where.push({
          ...baseWhere,
          id: In(workoutIds),
        });
      }
    }

    // Get paginated workouts and total count
    const [items, total] = await this.workoutRepo.findAndCount({
      where,
      relations: {
        exerciseLogs: {
          sets: true,
        },
      },
      order: {
        performedAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: items,
      meta: {
        total,
        totalPages,
        currentPage: page,
        limit: limit,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<Workout> {
    const workout = await this.workoutRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { exerciseLogs: { sets: true } },
    });
    if (!workout) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
    if (workout.userId !== userId) {
      throw new ForbiddenException('Cannot access another user’s workout');
    }
    return workout;
  }

  async update(userId: string, id: string, dto: UpdateWorkoutDto): Promise<Workout> {
    if (dto.exercises) {
      return this.updateWithExercises(userId, id, dto);
    }
    const workout = await this.findOwned(userId, id);
    if (dto.title !== undefined) workout.title = dto.title;
    if (dto.performedAt !== undefined) workout.performedAt = new Date(dto.performedAt);
    return this.workoutRepo.save(workout);
  }

  private async updateWithExercises(
    userId: string,
    id: string,
    dto: UpdateWorkoutDto,
  ): Promise<Workout> {
    return this.dataSource.transaction(async (manager) => {
      const workout = await manager.findOne(Workout, {
        where: { id, deletedAt: IsNull() },
        relations: { exerciseLogs: true },
      });
      if (!workout) {
        throw new NotFoundException(WORKOUT_NOT_FOUND);
      }
      if (workout.userId !== userId) {
        throw new ForbiddenException('Cannot modify another user’s workout');
      }

      const oldExerciseNames = workout.exerciseLogs.map((log) => log.exerciseName);

      if (dto.title !== undefined) workout.title = dto.title;
      if (dto.performedAt !== undefined) workout.performedAt = new Date(dto.performedAt);
      await manager.save(Workout, workout);

      await manager.delete(ExerciseLog, { workoutId: workout.id });

      const newExerciseNames: string[] = [];
      for (const exercise of dto.exercises ?? []) {
        newExerciseNames.push(exercise.exerciseName);
        const log = await manager.save(ExerciseLog, {
          workoutId: workout.id,
          exerciseName: exercise.exerciseName,
        });
        for (const set of exercise.sets) {
          await manager.save(Set, {
            exerciseLogId: log.id,
            reps: set.reps,
            weightKg: set.weightKg,
          });
        }
      }

      const affectedNames = [...oldExerciseNames, ...newExerciseNames].filter(
        (name, index, names) => names.indexOf(name) === index,
      );
      for (const exerciseName of affectedNames) {
        await this.personalRecords.recomputeForExercise(manager, userId, exerciseName);
      }

      const updated = await manager.findOne(Workout, {
        where: { id: workout.id },
        relations: { exerciseLogs: { sets: true } },
      });
      if (!updated) {
        throw new NotFoundException(WORKOUT_NOT_FOUND);
      }
      return updated;
    });
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const workout = await manager.findOne(Workout, {
        where: { id, deletedAt: IsNull() },
        relations: { exerciseLogs: true },
      });
      if (!workout) {
        throw new NotFoundException(WORKOUT_NOT_FOUND);
      }
      if (workout.userId !== userId) {
        throw new ForbiddenException('Cannot modify another user’s workout');
      }

      workout.deletedAt = new Date();
      await manager.save(Workout, workout);

      const exerciseNames = workout.exerciseLogs
        .map((log) => log.exerciseName)
        .filter((name, index, names) => names.indexOf(name) === index);
      for (const exerciseName of exerciseNames) {
        await this.personalRecords.recomputeForExercise(manager, userId, exerciseName);
      }
    });
  }

  private async findOwned(userId: string, id: string): Promise<Workout> {
    const workout = await this.workoutRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!workout) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
    if (workout.userId !== userId) {
      throw new ForbiddenException('Cannot modify another user’s workout');
    }
    return workout;
  }
}
