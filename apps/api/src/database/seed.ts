import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Workout } from '../modules/workouts/workout.entity';
import { ExerciseLog } from '../modules/workouts/exercise-log.entity';
import { Set } from '../modules/workouts/set.entity';
import { PersonalRecord } from '../modules/personal-records/personal-record.entity';
import { CoachAthlete } from '../modules/coach/coach-athlete.entity';

/**
 * userId is a plain FK into the gateway's `users` table (same Postgres database,
 * no local users table) — this seed reads real seeded gateway ids by email
 * rather than fabricating unrelated uuids, so the demo's ownership-block case
 * points at a genuine second account.
 */
async function findUserId(
  dataSourceRef: typeof dataSource,
  email: string,
): Promise<string> {
  const rows: Array<{ id: string }> = await dataSourceRef.query(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );
  if (!rows[0]) {
    throw new Error(`Expected gateway seed user "${email}" — run "pnpm seed" first`);
  }
  return rows[0].id;
}

async function logWorkout(
  athleteId: string,
  title: string,
  performedAt: string,
  exercises: Array<{ name: string; sets: Array<{ reps: number; weightKg: number }> }>,
): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const workout = await manager.save(Workout, {
      userId: athleteId,
      title,
      performedAt: new Date(performedAt),
      deletedAt: null,
    });
    for (const exercise of exercises) {
      const log = await manager.save(ExerciseLog, {
        workoutId: workout.id,
        exerciseName: exercise.name,
      });
      for (const set of exercise.sets) {
        await manager.save(Set, {
          exerciseLogId: log.id,
          reps: set.reps,
          weightKg: set.weightKg,
        });
      }
    }
  });
}

async function seedWorkoutData(
  athleteId: string,
  secondAthleteId: string,
): Promise<void> {
  await logWorkout(athleteId, 'Push Day', '2026-08-01T09:00:00.000Z', [
    {
      name: 'Bench Press',
      sets: [
        { reps: 8, weightKg: 80 },
        { reps: 6, weightKg: 85 },
      ],
    },
    {
      name: 'Overhead Press',
      sets: [
        { reps: 8, weightKg: 40 },
        { reps: 6, weightKg: 45 },
      ],
    },
  ]);

  await logWorkout(athleteId, 'Leg Day', '2026-08-05T09:00:00.000Z', [
    {
      name: 'Squat',
      sets: [
        { reps: 5, weightKg: 100 },
        { reps: 5, weightKg: 105 },
      ],
    },
    {
      name: 'Deadlift',
      sets: [
        { reps: 5, weightKg: 130 },
        { reps: 3, weightKg: 140 },
      ],
    },
  ]);

  await logWorkout(secondAthleteId, 'Pull Day', '2026-08-08T09:00:00.000Z', [
    {
      name: 'Bench Press',
      sets: [
        { reps: 10, weightKg: 60 },
        { reps: 8, weightKg: 65 },
      ],
    },
    {
      name: 'Pull-up',
      sets: [
        { reps: 10, weightKg: 0 },
        { reps: 8, weightKg: 0 },
      ],
    },
  ]);

  const prs: Array<Pick<PersonalRecord, 'exerciseName' | 'bestWeightKg' | 'bestReps'>> = [
    { exerciseName: 'Bench Press', bestWeightKg: 85, bestReps: 6 },
    { exerciseName: 'Overhead Press', bestWeightKg: 45, bestReps: 6 },
    { exerciseName: 'Squat', bestWeightKg: 105, bestReps: 5 },
    { exerciseName: 'Deadlift', bestWeightKg: 140, bestReps: 3 },
  ];
  for (const pr of prs) {
    await dataSource.getRepository(PersonalRecord).save({ userId: athleteId, ...pr });
  }
}

async function seedCoachAssignment(
  coachUserId: string,
  athleteUserId: string,
): Promise<void> {
  const repo = dataSource.getRepository(CoachAthlete);
  const existing = await repo.findOne({ where: { coachUserId, athleteUserId } });
  if (existing) {
    console.log('Coach assignment already exists — skipped.');
    return;
  }
  await repo.save({ coachUserId, athleteUserId });
  console.log('Coach assignment seeded: staff@demo.local -> user@demo.local');
}

async function seed() {
  await dataSource.initialize();

  const athleteId = await findUserId(dataSource, 'user@demo.local');
  const secondAthleteId = await findUserId(dataSource, 'admin@demo.local');
  const coachId = await findUserId(dataSource, 'staff@demo.local');

  const existingWorkouts = await dataSource.getRepository(Workout).count();
  if (existingWorkouts > 0) {
    console.log('Fitness-tracker seed skipped — workouts already exist.');
  } else {
    await seedWorkoutData(athleteId, secondAthleteId);
    console.log(
      'Fitness-tracker seed complete: 3 workouts, 6 exercise logs, 12 sets, 4 PRs.',
    );
  }

  await seedCoachAssignment(coachId, athleteId);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
