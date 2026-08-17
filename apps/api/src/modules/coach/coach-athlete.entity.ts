import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'coach_athletes' })
@Unique('UQ_coach_athletes_coach_athlete', ['coachUserId', 'athleteUserId'])
export class CoachAthlete {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'coach_user_id', type: 'uuid' })
  coachUserId!: string;

  @Column({ name: 'athlete_user_id', type: 'uuid' })
  athleteUserId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
