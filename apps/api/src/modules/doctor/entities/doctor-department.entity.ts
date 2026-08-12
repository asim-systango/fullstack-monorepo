import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';
import { Department } from '../../organization/entities/department.entity';

@Entity({ name: 'doctor_departments' })
export class DoctorDepartment {
  @PrimaryColumn({ name: 'doctor_id', type: 'uuid' })
  doctorId!: string;

  @ManyToOne(() => DoctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: DoctorProfile;

  @PrimaryColumn({ name: 'department_id', type: 'uuid' })
  departmentId!: string;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;
}
