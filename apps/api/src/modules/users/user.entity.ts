import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Read-only mirror of gateway `users` — domain does not own this table.
 * Needed so apps/api TypeORM can relate auctions/bids to users (e.g. bidder.name).
 * `synchronize: false` keeps migration:generate from altering gateway columns.
 */
@Entity({ name: 'users', synchronize: false })
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;
}
