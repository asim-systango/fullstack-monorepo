import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Exclusion,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveType } from '../leave-types/leave-type.entity';
import type { LeaveStatus } from './leave-status';

@Entity({ name: 'leave_requests' })
@Check('CHK_leave_requests_dates', '"endDate" >= "startDate"')
@Check('CHK_leave_requests_days', '"days" > 0')
@Check(
  'CHK_leave_requests_same_year',
  'EXTRACT(YEAR FROM "startDate") = EXTRACT(YEAR FROM "endDate")',
)
@Check(
  'CHK_leave_requests_status',
  `"status" IN ('pending', 'approved', 'rejected', 'cancelled')`,
)
// same user can't have overlapping pending/approved leave
@Exclusion(
  'EXC_leave_requests_no_overlap',
  `USING gist ("userId" WITH =, daterange("startDate", "endDate", '[]') WITH &&) WHERE ("status" IN ('pending', 'approved') AND "deletedAt" IS NULL)`,
)
@Index('IDX_leave_requests_user_status', ['userId', 'status'])
@Index('IDX_leave_requests_status_start', ['status', 'startDate'])
@Index('IDX_leave_requests_leave_type', ['leaveTypeId'])
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_leave_requests' })
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'leaveTypeId',
    foreignKeyConstraintName: 'FK_leave_requests_leave_type',
  })
  leaveType?: LeaveType;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'int' })
  days!: number;

  @Column({ type: 'varchar', length: 500 })
  reason!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: LeaveStatus;

  // manager who decided, or admin for a manager's own leave
  @Column({ type: 'uuid', nullable: true })
  managerId!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  managerComment!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // soft delete
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date | null;
}
