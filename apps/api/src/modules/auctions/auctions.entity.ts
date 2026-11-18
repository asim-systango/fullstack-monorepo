import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type AuctionStatus = 'open' | 'closed' | 'cancelled';

@Entity({ name: 'auctions' })
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({
    name: 'starting_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  startingPrice!: string;

  @Column({
    name: 'min_increment',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  minIncrement!: string;

  @Column({
    name: 'current_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  currentPrice!: string;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'open',
  })
  status!: AuctionStatus;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'winner_id', type: 'uuid', nullable: true })
  winnerId!: string | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
