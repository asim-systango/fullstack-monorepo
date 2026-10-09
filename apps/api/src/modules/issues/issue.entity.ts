import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { IssueStatus } from './types';

@Entity({ name: 'issues' })
@Check(`"status" IN ('todo', 'in_progress', 'done')`)
export class Issue {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Index() @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;

  @Column() title!: string;

  @Column({ type: 'text', default: '' }) description!: string;

  @Column({ type: 'varchar', length: 20, default: 'todo' }) status!: IssueStatus;

  @Column({ name: 'assignee_id', type: 'uuid', nullable: true }) assigneeId!:
    string | null;

  @Column({ name: 'sprint_id', type: 'uuid', nullable: true }) sprintId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
