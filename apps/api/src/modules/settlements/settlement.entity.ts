import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

@Entity({ name: 'settlements' })
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @Column({ name: 'payer_user_id', type: 'uuid' })
  payerUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payer_user_id' })
  payer!: User;

  @Column({ name: 'payee_user_id', type: 'uuid' })
  payeeUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payee_user_id' })
  payeeUser!: User;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy!: User;

  @Column({ name: 'amount_cents', type: 'integer' })
  amountCents!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note!: string | null;

  @Column({ name: 'settled_at', type: 'timestamptz' })
  settledAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
