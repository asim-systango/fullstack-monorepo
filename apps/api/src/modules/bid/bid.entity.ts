import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'bids' })
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Auction, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'auction_id' })
  auction!: Auction;

  @Column({ name: 'auction_id', type: 'uuid' })
  auctionId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'bidder_id' })
  bidder!: User;

  @Column({ name: 'bidder_id', type: 'uuid' })
  bidderId!: string;

  @Column({
    name: 'bid_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  bidAmount!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
