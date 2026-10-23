import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
