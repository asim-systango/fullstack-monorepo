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

export enum RestaurantDietType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  BOTH = 'both',
}

@Entity({ name: 'restaurants' })
@Check('CHK_restaurants_rating', '"rating" >= 0 AND "rating" <= 5')
@Check('CHK_restaurants_diet_type', `"diet_type" IN ('veg', 'non_veg', 'both')`)
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'image_url', type: 'varchar', length: 512, nullable: true })
  imageUrl: string | null;

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

  @Column({
    name: 'diet_type',
    type: 'varchar',
    length: 16,
    default: RestaurantDietType.BOTH,
  })
  dietType: RestaurantDietType;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems: MenuItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
