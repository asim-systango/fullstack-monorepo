import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sprints' })
export class Sprint {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column() name!: string;
  @Column({ name: 'start_date', type: 'date', nullable: true }) startDate!: string | null;
  @Column({ name: 'end_date', type: 'date', nullable: true }) endDate!: string | null;
}
