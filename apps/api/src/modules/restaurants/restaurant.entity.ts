import {
  Column,
  Check,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalToNumber } from '../../common/decimal.transformer';
import { MenuItem } from './menu-item.entity';

@Entity({ name: 'restaurants' })
@Check('CHK_restaurants_rating', '"rating" >= 0 AND "rating" <= 5')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The user is stored in api-gateway, so only its id is kept here.
  @Index('IDX_restaurants_owner_user_id')
  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 80 })
  cuisine: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  emoji: string | null;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
    transformer: decimalToNumber,
  })
  rating: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  eta: string | null;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems: MenuItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
