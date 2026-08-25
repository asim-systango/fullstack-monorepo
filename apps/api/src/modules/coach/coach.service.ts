import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ListWorkoutsDto } from '../workouts/dto/list-workouts.dto';
import { PaginatedWorkouts, WorkoutsService } from '../workouts';
import { PersonalRecord, PersonalRecordsService } from '../personal-records';
import { CoachAthlete } from './coach-athlete.entity';

export type AssignedAthlete = {
  athleteId: string;
  email: string;
  name: string | null;
};

export type CoachOrAthleteUser = {
  id: string;
  email: string;
  name: string | null;
};

export type CoachAssignment = {
  id: string;
  coach: CoachOrAthleteUser;
  athlete: CoachOrAthleteUser;
  createdAt: string;
};

type AssignmentRow = {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  created_at: string;
  coach_email: string;
  coach_name: string | null;
  athlete_email: string;
  athlete_name: string | null;
};

@Injectable()
export class CoachService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(CoachAthlete)
    private readonly coachAthleteRepo: Repository<CoachAthlete>,
    private readonly workoutsService: WorkoutsService,
    private readonly personalRecords: PersonalRecordsService,
  ) {}

  async listAthletes(coachUserId: string): Promise<AssignedAthlete[]> {
    const assignments = await this.coachAthleteRepo.find({ where: { coachUserId } });
    if (assignments.length === 0) return [];

    const athleteIds = assignments.map(({ athleteUserId }) => athleteUserId);
    const rows: Array<{ id: string; email: string; name: string | null }> =
      await this.dataSource.query(
        `SELECT id, email, name FROM users WHERE id = ANY($1::uuid[])`,
        [athleteIds],
      );

    const usersById = new Map(rows.map((row) => [row.id, row]));
    return athleteIds.map((athleteId) => {
      const user = usersById.get(athleteId);
      return { athleteId, email: user?.email ?? 'unknown', name: user?.name ?? null };
    });
  }

  async getAthletesDetails(
    coachUserId: string,
    athleteId: string,
  ): Promise<AssignedAthlete> {
    await this.ensureAthleteAssigned(coachUserId, athleteId);

    const rows: Array<{ id: string; email: string; name: string | null }> =
      await this.dataSource.query(`SELECT id, email, name FROM users WHERE id = $1`, [
        athleteId,
      ]);

    const athlete = rows[0];

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    return {
      athleteId: athlete.id,
      email: athlete.email ?? 'unknown',
      name: athlete.name ?? null,
    };
  }

  async getAthleteWorkouts(
    coachUserId: string,
    athleteId: string,
    query: ListWorkoutsDto,
  ): Promise<PaginatedWorkouts> {
    await this.ensureAthleteAssigned(coachUserId, athleteId);
    return this.workoutsService.findAll(athleteId, query);
  }

  async getAthletePrs(coachUserId: string, athleteId: string): Promise<PersonalRecord[]> {
    await this.ensureAthleteAssigned(coachUserId, athleteId);
    return this.personalRecords.findAllExerciseForUser(athleteId);
  }

  private async ensureAthleteAssigned(
    coachUserId: string,
    athleteId: string,
  ): Promise<void> {
    const assignment = await this.coachAthleteRepo.findOne({
      where: { coachUserId, athleteUserId: athleteId },
    });
    if (!assignment) {
      throw new ForbiddenException('Athlete is not assigned to this coach');
    }
  }

  /** [Admin] Users eligible to be picked as a coach or an athlete in the assignment form. */
  async listUsersByRole(role: 'staff' | 'user'): Promise<CoachOrAthleteUser[]> {
    return this.dataSource.query(
      `SELECT id, email, name FROM users WHERE role = $1 ORDER BY name NULLS LAST, email`,
      [role],
    );
  }

  /** [Admin] Every coach↔athlete assignment, with user display info joined in. */
  async listAssignments(): Promise<CoachAssignment[]> {
    const rows = await this.coachAthleteRepo
      .createQueryBuilder('ca')
      .innerJoin('users', 'coach', 'coach.id = ca.coach_user_id::uuid')
      .innerJoin('users', 'athlete', 'athlete.id = ca.athlete_user_id::uuid')
      .select([
        'ca.id AS id',
        'ca.coach_user_id AS coach_user_id',
        'ca.athlete_user_id AS athlete_user_id',
        'ca.created_at AS created_at',

        'coach.email AS coach_email',
        'coach.name AS coach_name',

        'athlete.email AS athlete_email',
        'athlete.name AS athlete_name',
      ])
      .orderBy('ca.created_at', 'DESC')
      .getRawMany<AssignmentRow>();

    return rows.map((row) => this.toAssignment(row));
  }

  /** [Admin] Assigns an athlete (role `user`) to a coach (role `staff`). */
  async assignAthlete(
    coachUserId: string,
    athleteUserId: string,
  ): Promise<CoachAssignment> {
    const [coachRows, athleteRows]: [
      Array<{ id: string; name: string; email: string }>,
      Array<{ id: string; name: string; email: string }>,
    ] = await Promise.all([
      this.dataSource.query(
        `SELECT id, email, name FROM users WHERE id = $1 AND role = 'staff'`,
        [coachUserId],
      ),
      this.dataSource.query(
        `SELECT id, email, name FROM users WHERE id = $1 AND role = 'user'`,
        [athleteUserId],
      ),
    ]);
    //  Validate coach
    if (coachRows.length === 0) {
      throw new BadRequestException('coachUserId must belong to a staff (coach) user');
    }
    //  Validate athlete

    if (athleteRows.length === 0) {
      throw new BadRequestException('athleteUserId must belong to a user (athlete) user');
    }

    const existing = await this.coachAthleteRepo.findOne({
      where: { coachUserId, athleteUserId },
    });
    if (existing) {
      throw new ConflictException('This athlete is already assigned to this coach');
    }

    const created = await this.coachAthleteRepo.save({ coachUserId, athleteUserId });
    return {
      id: created.id,
      coach: {
        id: coachRows[0]?.id ?? '',
        email: coachRows[0]?.email ?? '',
        name: coachRows[0]?.name ?? '',
      },
      athlete: {
        id: athleteRows[0]?.id ?? '',
        email: athleteRows[0]?.email ?? '',
        name: athleteRows[0]?.name ?? '',
      },
      createdAt: created.createdAt.toISOString(),
    };
  }

  /** [Admin] Removes a coach-athlete assignment. */
  async unassignAthlete(id: string): Promise<void> {
    const result = await this.coachAthleteRepo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException('Assignment not found');
    }
  }

  private toAssignment(row: AssignmentRow): CoachAssignment {
    return {
      id: row.id,
      coach: { id: row.coach_user_id, email: row.coach_email, name: row.coach_name },
      athlete: {
        id: row.athlete_user_id,
        email: row.athlete_email,
        name: row.athlete_name,
      },
      createdAt: row.created_at,
    };
  }
}
