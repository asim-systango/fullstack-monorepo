import { Entity, PrimaryColumn, Column, Unique, ManyToMany, BeforeInsert } from 'typeorm';
import { ulid } from 'ulid';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
@Unique(['name'])
export class Permission {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  createdAt!: number;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
