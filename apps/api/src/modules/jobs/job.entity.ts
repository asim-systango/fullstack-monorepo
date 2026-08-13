import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { JobStatus } from './job-status.enum';

@Entity({ name: 'jobs' })
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Column({ name: 'company_id' })
  companyId!: string;

  @Column()
  title!: string;

  @Index()
  @Column()
  location!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index()
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN })
  status!: JobStatus;

  @Index()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}