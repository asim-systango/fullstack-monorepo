import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'hospital_id', type: 'uuid', nullable: true })
  hospitalId!: string | null;

  @Index()
  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ name: 'actor_role', type: 'varchar', length: 50 })
  actorRole!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 50 })
  entityName!: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'changes_before', type: 'jsonb', nullable: true })
  changesBefore!: Record<string, unknown> | null;

  @Column({ name: 'changes_after', type: 'jsonb', nullable: true })
  changesAfter!: Record<string, unknown> | null;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
