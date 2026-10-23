import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';
import { IssueLabel } from '../labels/issue-label.entity';

export type IssueStatus = 'todo' | 'in_progress' | 'done';

@Entity({ name: 'issues' })
@Check(`"status" IN ('todo', 'in_progress', 'done')`)
@Index('IDX_issues_project_status', ['projectId', 'status'])
@Index('IDX_issues_deleted_at', ['deletedAt'])
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 20, default: 'todo' })
  status!: IssueStatus;

  @Column({ name: 'assignee_id', type: 'uuid', nullable: true })
  assigneeId!: string | null;

  @Column({ name: 'reporter_id', type: 'uuid' })
  reporterId!: string;

  @OneToMany(() => Comment, (comment) => comment.issue)
  comments!: Comment[];

  @OneToMany(() => ActivityLog, (log) => log.issue)
  activityLogs!: ActivityLog[];

  @OneToMany(() => IssueLabel, (il) => il.issue)
  issueLabels!: IssueLabel[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
