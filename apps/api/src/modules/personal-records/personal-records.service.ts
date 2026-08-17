import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PersonalRecord } from './personal-record.entity';
import { Set } from '../workouts/set.entity';

export type SetResult = {
  weightKg?: number | null;
  reps: number;
};

@Injectable()
export class PersonalRecordsService {
  constructor(
    @InjectRepository(PersonalRecord)
    private readonly personalRecordRepo: Repository<PersonalRecord>,
  ) {}

  findAllExerciseForUser(userId: string): Promise<PersonalRecord[]> {
    return this.personalRecordRepo.find({
      where: { userId },
      order: { exerciseName: 'ASC' },
    });
  }

  findOneExerciseForUser(
    userId: string,
    exerciseName: string,
  ): Promise<PersonalRecord | null> {
    return this.personalRecordRepo.findOne({ where: { userId, exerciseName } });
  }

  // Updates the PR only if the new set performs better, and saves it with the workout in the same transaction.
  async upsertIfBeaten(
    manager: EntityManager,
    userId: string,
    exerciseName: string,
    set: SetResult,
  ): Promise<PersonalRecord | null> {
    const existing = await manager.findOne(PersonalRecord, {
      where: { userId, exerciseName },
    });

    const weightKg = set.weightKg ?? null;

    if (!existing) {
      return manager.save(PersonalRecord, {
        userId,
        exerciseName,
        bestWeightKg: weightKg,
        bestReps: set.reps,
      });
    }

    const beats =
      weightKg !== null
        ? weightKg > Number(existing.bestWeightKg)
        : set.reps > existing.bestReps;

    if (!beats) {
      return null;
    }

    existing.bestWeightKg = weightKg;
    existing.bestReps = set.reps;
    return manager.save(PersonalRecord, existing);
  }

  // Recalculates the PR from all active workouts, so it can increase, decrease, or be removed after an edit.
  async recomputeForExercise(
    manager: EntityManager,
    userId: string,
    exerciseName: string,
  ): Promise<void> {
    // find active sets
    const sets = await manager
      .createQueryBuilder(Set, 'set')
      .innerJoin('set.exerciseLog', 'log')
      .innerJoin('log.workout', 'workout')
      .where('workout.userId = :userId', { userId })
      .andWhere('workout.deletedAt IS NULL')
      .andWhere('log.exerciseName = :exerciseName', { exerciseName })
      .getMany();

    // find the existing execise in personal record
    const existing = await manager.findOne(PersonalRecord, {
      where: { userId, exerciseName },
    });

    if (sets.length === 0) {
      // if no active sets found so we are removing the PR data
      if (existing) await manager.remove(PersonalRecord, existing);
      return;
    }

    const weighted = sets.filter((set) => set.weightKg !== null);
    const candidates = weighted.length > 0 ? weighted : sets;
    const compareByWeight = weighted.length > 0;

    const [firstCandidate, ...restCandidates] = candidates;
    if (!firstCandidate) return;

    let best = firstCandidate;
    for (const candidate of restCandidates) {
      const candidateIsBetter = compareByWeight
        ? Number(candidate.weightKg) > Number(best.weightKg)
        : candidate.reps > best.reps;
      if (candidateIsBetter) best = candidate;
    }

    const bestWeightKg = best.weightKg === null ? null : Number(best.weightKg);
    const bestReps = best.reps;

    if (!existing) {
      await manager.save(PersonalRecord, {
        userId,
        exerciseName,
        bestWeightKg,
        bestReps: bestReps,
      });
      return;
    }

    existing.bestWeightKg = bestWeightKg;
    existing.bestReps = bestReps;
    await manager.save(PersonalRecord, existing);
  }
}
