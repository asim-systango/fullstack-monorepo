import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy!: User;

  @Column({ name: 'blocked_at', type: 'timestamptz', nullable: true })
  blockedAt!: Date | null;

  @Column({ name: 'blocked_by_user_id', type: 'uuid', nullable: true })
  blockedByUserId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'blocked_by_user_id' })
  blockedBy!: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
