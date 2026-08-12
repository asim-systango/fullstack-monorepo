import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';
import { Department } from './department.entity';

@Entity({ name: 'staff_profiles' })
export class StaffProfile extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ name: 'hospital_id', type: 'uuid' })
  hospitalId!: string;

  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital;

  @Index()
  @Column({ name: 'department_id', type: 'uuid' })
  departmentId!: string;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({ name: 'staff_type', type: 'varchar', length: 30 })
  staffType!: string;

  @Column({ name: 'shift_schedule', type: 'varchar', length: 50, nullable: true })
  shiftSchedule!: string | null;
}
