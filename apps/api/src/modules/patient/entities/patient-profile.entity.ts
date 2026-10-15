import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Patient extended profile.
 *
 * Linked to a gateway User via userId (1:1, where users.role = 'PATIENT').
 * The core authentication & identity lives in the `users` table (api-gateway).
 * This table holds health-specific fields that only make sense for patients.
 *
 * Design note:
 *   users  ──────1:1──────▶  patient_profiles
 *   (role='PATIENT')           (blood group, DOB, etc.)
 *
 * Keeping profiles separate means the users table stays lean and role-agnostic.
 */
@Entity({ name: 'patient_profiles' })
export class PatientProfile extends BaseEntity {
  /**
   * Foreign key → users.id (api-gateway).
   * One patient user has exactly one profile row.
   */
  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  /** Patient's preferred display name (may differ from users.name). */
  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName!: string | null;

  /** Date of birth — used for age-sensitive appointment logic. */
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: Date | null;

  /** Biological sex — informational for doctors. */
  @Column({ type: 'varchar', length: 10, nullable: true })
  gender!: 'MALE' | 'FEMALE' | 'OTHER' | null;

  /** ABO/Rh blood group (e.g. "A+", "O-"). */
  @Column({ name: 'blood_group', type: 'varchar', length: 5, nullable: true })
  bloodGroup!: string | null;

  /** Emergency contact phone number. */
  @Column({ name: 'emergency_contact', type: 'varchar', length: 20, nullable: true })
  emergencyContact!: string | null;

  /** Any known allergies, free-text. */
  @Column({ type: 'text', nullable: true })
  allergies!: string | null;

  /** Brief chronic condition notes for the doctor (e.g. "Diabetic, Hypertensive"). */
  @Column({ name: 'medical_history', type: 'text', nullable: true })
  medicalHistory!: string | null;

  /** Profile/avatar image path (relative to upload root). */
  @Column({ name: 'profile_image', type: 'varchar', length: 255, nullable: true })
  profileImage!: string | null;
}
