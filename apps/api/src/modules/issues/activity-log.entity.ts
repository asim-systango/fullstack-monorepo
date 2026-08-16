import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'from_status', type: 'varchar', length: 20, nullable: true })
  fromStatus!: string | null;
  @Column({ name: 'to_status', type: 'varchar', length: 20 }) toStatus!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
