import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bids' })
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'auction_id', type: 'uuid' })
  auctionId!: string;

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
