import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBids1794922059014 implements MigrationInterface {
  name = 'CreateBids1794922059014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create bids table
    await queryRunner.query(`
      CREATE TABLE "bids" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "auction_id" uuid NOT NULL,
        "bidder_id" uuid NOT NULL,
        "bid_amount" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "PK_bids"
          PRIMARY KEY ("id"),

        CONSTRAINT "CHK_bids_bid_amount"
          CHECK ("bid_amount" > 0)
      )
    `);

    // 2. Auction foreign key
    await queryRunner.query(`
      ALTER TABLE "bids"
      ADD CONSTRAINT "FK_bids_auction"
      FOREIGN KEY ("auction_id")
      REFERENCES "auctions"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    // 3. Bidder foreign key
    await queryRunner.query(`
      ALTER TABLE "bids"
      ADD CONSTRAINT "FK_bids_bidder"
      FOREIGN KEY ("bidder_id")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bids"`);
  }
}
