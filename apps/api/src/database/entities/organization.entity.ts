import { Entity, PrimaryColumn, Column, BeforeInsert, Index } from 'typeorm';
import { ulid } from 'ulid';

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ length: 150 })
  @Index()
  name!: string;

  @Column({ length: 160, unique: true })
  @Index()
  slug!: string;

  @Column({ length: 255, unique: true })
  primaryDomain!: string;

  @Column({ length: 255 })
  @Index()
  email!: string;

  @Column({ length: 30 })
  phone!: string;

  @Column({ length: 100 })
  @Index()
  industry!: string;

  @Column({ type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ length: 255, nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, default: 'Asia/Kolkata' })
  timezone!: string;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  @Index()
  status!: OrganizationStatus;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  createdBy?: string;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  ownerId?: string;

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
