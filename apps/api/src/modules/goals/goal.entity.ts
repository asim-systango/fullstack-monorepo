import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'goals' })
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'exercise_name' })
  exerciseName!: string;

  @Column({ name: 'target_weight_kg', type: 'numeric', precision: 6, scale: 2 })
  targetWeightKg!: number;

  @Column({ name: 'target_reps', type: 'int', nullable: true })
  targetReps!: number | null;

  @Column({ name: 'target_date', type: 'date', nullable: true })
  targetDate!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
