import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Hospital Admin extended profile.
 *
 * Linked to a gateway User via userId (1:1, where users.role = 'ADMIN').
 * The core authentication & identity lives in the `users` table.
 * This table holds hospital/admin-specific fields.
 *
 * Design note:
 *   users  ──────1:1──────▶  hospital_admins
 *   (role='ADMIN')             (hospital name, department, contact, etc.)
 *
 * Keeping profiles separate means the users table stays lean and role-agnostic,
 * and each role's profile can evolve independently.
 */
@Entity({ name: 'hospital_admins' })
export class HospitalAdmin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Foreign key → users.id.
   * One admin user has exactly one hospital_admins profile row.
   */
  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  /** Official name of the hospital this admin manages. */
  @Column({ name: 'hospital_name', type: 'varchar', length: 150, nullable: true })
  hospitalName!: string | null;

  /** e.g. "Operations", "Medical Affairs", "Finance". */
  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  /** Admin's job title (e.g. "Chief Medical Officer"). */
  @Column({ name: 'job_title', type: 'varchar', length: 100, nullable: true })
  jobTitle!: string | null;

  /** Direct office/contact phone number. */
  @Column({ name: 'office_phone', type: 'varchar', length: 20, nullable: true })
  officePhone!: string | null;

  /** Hospital address / physical location. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  /** Profile/avatar image path. */
  @Column({ name: 'profile_image', type: 'varchar', length: 255, nullable: true })
  profileImage!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
