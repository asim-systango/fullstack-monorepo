import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Submission } from '../submissions/submission.entity';

@Entity({ name: 'grades' })
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  submissionId!: string;

  @OneToOne(() => Submission, (submission) => submission.grade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission!: Submission;

  @Column({ type: 'uuid' })
  graderId!: string;

  @Column({ type: 'integer' })
  score!: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
