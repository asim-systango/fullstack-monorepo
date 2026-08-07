import { Entity, PrimaryColumn, Column, BeforeInsert, Index } from 'typeorm';
import { ulid } from 'ulid';

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  SALES_LEAD = 'SALES_LEAD',
  SALES_REP = 'SALES_REP',
}

@Entity({ name: 'roles' })
export class Role {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ length: 50, unique: true })
  @Index()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  createdAt!: number;
}
