import { Entity, PrimaryColumn, Column, BeforeInsert, Index } from 'typeorm';
import { ulid } from 'ulid';

export enum FormType {
  ORGANIZATION_ONBOARDING_REQUEST = 'ORGANIZATION_ONBOARDING_REQUEST',
  CONTACT_US = 'CONTACT_US',
  DEMO_REQUEST = 'DEMO_REQUEST',
}

export enum FormSubmissionStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'form_submissions' })
export class FormSubmission {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({
    type: 'enum',
    enum: FormType,
    default: FormType.ORGANIZATION_ONBOARDING_REQUEST,
  })
  @Index()
  formType!: FormType;

  @Column({
    type: 'enum',
    enum: FormSubmissionStatus,
    default: FormSubmissionStatus.PENDING,
  })
  @Index()
  status!: FormSubmissionStatus;

  @Column({ length: 150 })
  contactName!: string;

  @Column({ length: 255 })
  @Index()
  email!: string;

  @Column({ length: 30, nullable: true })
  phone?: string;

  @Column({ length: 150, nullable: true })
  @Index()
  companyName?: string;

  @Column({ length: 50, nullable: true })
  companySize?: string;

  @Column({ length: 100, nullable: true })
  industry?: string;

  @Column({ length: 255, nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  reviewedBy?: string;

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ type: 'bigint', nullable: true })
  reviewedAt?: number;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  @Index()
  createdAt!: number;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  updatedAt!: number;
}
