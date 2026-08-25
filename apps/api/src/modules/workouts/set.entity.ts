import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExerciseLog } from './exercise-log.entity';

@Entity({ name: 'sets' })
export class Set {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'exercise_log_id' })
  exerciseLogId!: string;

  @ManyToOne(() => ExerciseLog, (log) => log.sets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exercise_log_id' })
  exerciseLog!: ExerciseLog;

  @Column()
  reps!: number;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 6, scale: 2, nullable: true })
  weightKg!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
