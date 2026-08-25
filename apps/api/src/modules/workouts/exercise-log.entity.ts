import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Workout } from './workout.entity';
import { Set } from './set.entity';

@Entity({ name: 'exercise_logs' })
export class ExerciseLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workout_id' })
  workoutId!: string;

  @ManyToOne(() => Workout, (workout) => workout.exerciseLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_id' })
  workout!: Workout;

  @Column({ name: 'exercise_name' })
  exerciseName!: string;

  @OneToMany(() => Set, (set) => set.exerciseLog, { cascade: true })
  sets!: Set[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
