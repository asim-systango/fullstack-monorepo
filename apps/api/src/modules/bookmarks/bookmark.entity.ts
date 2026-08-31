import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Job } from '../jobs/job.entity';

@Entity({ name: 'bookmarks' })
// Same double-apply pattern as Application: uniqueness is a real DB rule, not just a service check.
@Unique(['userId', 'jobId'])
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Cross-service user ref — Users live on the gateway DB, so this is a trusted string, not an FK.
  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => Job, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ name: 'job_id' })
  jobId!: string;

  // Own entity (not ManyToMany) so we can sort bookmarks by when the candidate saved them.
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
