import {
  Column, CreateDateColumn, Entity, Index, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';
import { ApplicationStatus } from './application-status.enum';

@Entity({ name: 'applications' })
@Unique(['jobId', 'candidateUserId'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Job, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ name: 'job_id' })
  jobId!: string;

  @Index()
  @Column({ name: 'candidate_user_id' })
  candidateUserId!: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.SUBMITTED })
  status!: ApplicationStatus;

  @Column({ type: 'text' })
  coverLetter!: string;

  @Column({ nullable: true })
  resumeUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}