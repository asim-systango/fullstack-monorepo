import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';

export type PlanExercise = {
  exerciseName: string;
  targetSets: number;
  targetReps: number;
};

@Entity({ name: 'plan_days' })
export class PlanDay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'plan_id' })
  planId!: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: WorkoutPlan;

  @Column({ name: 'day_label' })
  dayLabel!: string;

  @Column()
  order!: number;

  @Column({ type: 'jsonb' })
  exercises!: PlanExercise[];
}
