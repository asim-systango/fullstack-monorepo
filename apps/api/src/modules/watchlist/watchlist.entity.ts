import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'watchlists' })
@Unique(['userId', 'auctionId'])
@Index('IDX_watchlists_auction_id', ['auctionId'])
export class Watchlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // one user can have must watchlist items
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  // one auction can be watched by multiple users. i.e, there can be multiple watchlst items for same auctions which are watched by different users
  @ManyToOne(() => Auction, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'auction_id' })
  auction!: Auction;

  @Column({ name: 'auction_id', type: 'uuid' })
  auctionId!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
