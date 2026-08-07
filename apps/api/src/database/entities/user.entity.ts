import { Entity, PrimaryColumn, Column, BeforeInsert, Index } from 'typeorm';
import { ulid } from 'ulid';

export enum UserRole {
  ADMIN = 'admin',
  SALES_LEAD = 'sales_lead',
  REP = 'rep',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.REP,
  })
  @Index()
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  createdAt!: number;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  updatedAt!: number;
}
