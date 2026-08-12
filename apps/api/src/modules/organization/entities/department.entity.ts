import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';

@Entity({ name: 'departments' })
export class Department extends BaseEntity {
  @Index()
  @Column({ name: 'hospital_id', type: 'uuid' })
  hospitalId!: string;

  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'head_doctor_id', type: 'uuid', nullable: true })
  headDoctorId!: string | null;

  @Column({ name: 'location_floor', type: 'varchar', length: 50, nullable: true })
  locationFloor!: string | null;
}
