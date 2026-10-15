import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveType } from '../leave-types/leave-type.entity';

@Entity({ name: 'leave_balances' })
@Unique('UQ_leave_balances_user_type_year', ['userId', 'leaveTypeId', 'year'])
@Check('CHK_leave_balances_used_lte_total', '"usedDays" <= "totalDays"')
@Check('CHK_leave_balances_non_negative', '"usedDays" >= 0 AND "totalDays" >= 0')
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_leave_balances' })
  id!: string;

  // no FK here, users table belongs to the gateway
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'leaveTypeId',
    foreignKeyConstraintName: 'FK_leave_balances_leave_type',
  })
  leaveType?: LeaveType;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  totalDays!: number;

  @Column({ type: 'int', default: 0 })
  usedDays!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
