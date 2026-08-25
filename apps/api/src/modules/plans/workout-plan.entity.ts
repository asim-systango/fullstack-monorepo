import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanDay } from './plan-day.entity';

@Entity({ name: 'workout_plans' })
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => PlanDay, (day) => day.plan, { cascade: true })
  days!: PlanDay[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
