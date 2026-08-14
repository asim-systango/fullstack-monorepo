import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'resume_metas' })
export class ResumeMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Cross-service candidate ref — no FK to users (different service/database).
  @Index()
  @Column({ name: 'candidate_user_id' })
  candidateUserId!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  label?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
