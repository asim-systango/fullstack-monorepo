import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * One-time wipe + rebuild of auction domain tables to a clean final shape.
 * Does not edit prior migrations. Drops all auctions / bids / watchlists data.
 */
export class RecreateAuctionDomainTables1795200000000 implements MigrationInterface {
  name = 'RecreateAuctionDomainTables1795200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "watchlists" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bids" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auctions" CASCADE`);

    await queryRunner.query(`
      CREATE TABLE "auctions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "category" character varying(100) NOT NULL,
        "starting_price" numeric(10,2) NOT NULL,
        "min_increment" numeric(10,2) NOT NULL,
        "current_price" numeric(10,2) NOT NULL,
        "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'open',
        "seller_id" uuid NOT NULL,
        "winner_id" uuid,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "PK_auctions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_auctions_status"
          CHECK ("status" IN ('open', 'closed', 'cancelled')),
        CONSTRAINT "CHK_auctions_starting_price"
          CHECK ("starting_price" > 0),
        CONSTRAINT "CHK_auctions_min_increment"
          CHECK ("min_increment" > 0),
        CONSTRAINT "CHK_auctions_current_price"
          CHECK ("current_price" >= "starting_price")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "auctions"
      ADD CONSTRAINT "FK_auctions_seller"
      FOREIGN KEY ("seller_id")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "auctions"
      ADD CONSTRAINT "FK_auctions_winner"
      FOREIGN KEY ("winner_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "bids" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "auction_id" uuid NOT NULL,
        "bidder_id" uuid NOT NULL,
        "bid_amount" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "PK_bids" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_bids_bid_amount" CHECK ("bid_amount" > 0)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "bids"
      ADD CONSTRAINT "FK_bids_auction"
      FOREIGN KEY ("auction_id")
      REFERENCES "auctions"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bids"
      ADD CONSTRAINT "FK_bids_bidder"
      FOREIGN KEY ("bidder_id")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "watchlists" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "auction_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "PK_watchlists" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_watchlists_user_auction" UNIQUE ("user_id", "auction_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "watchlists"
      ADD CONSTRAINT "FK_watchlists_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "watchlists"
      ADD CONSTRAINT "FK_watchlists_auction"
      FOREIGN KEY ("auction_id")
      REFERENCES "auctions"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "watchlists" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bids" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auctions" CASCADE`);
  }
}
