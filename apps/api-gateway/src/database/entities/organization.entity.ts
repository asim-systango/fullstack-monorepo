import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ length: 255 })
  primaryDomain!: string;

  @Column({ length: 500, nullable: true })
  logoUrl?: string;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status!: OrganizationStatus;
}
