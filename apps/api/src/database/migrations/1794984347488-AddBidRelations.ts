import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBidRelations1794984347488 implements MigrationInterface {
  name = 'AddBidRelations1794984347488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "FK_auctions_seller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "FK_auctions_winner"`,
    );
    await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "FK_bids_auction"`);
    await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "FK_bids_bidder"`);
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "CHK_auctions_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "CHK_auctions_starting_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "CHK_auctions_min_increment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "CHK_auctions_current_price"`,
    );
    await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "CHK_bids_bid_amount"`);
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "FK_0cc14a58a02d6cf816e906d2c6b" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" ADD CONSTRAINT "FK_7d24f04e55838b694acc9d35bfe" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" ADD CONSTRAINT "FK_bc7e4d3d2bdc4c8d9695938d8e4" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bids" DROP CONSTRAINT "FK_bc7e4d3d2bdc4c8d9695938d8e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" DROP CONSTRAINT "FK_7d24f04e55838b694acc9d35bfe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "FK_0cc14a58a02d6cf816e906d2c6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" ADD CONSTRAINT "CHK_bids_bid_amount" CHECK ((bid_amount > (0)::numeric))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_current_price" CHECK ((current_price >= starting_price))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_min_increment" CHECK ((min_increment > (0)::numeric))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_starting_price" CHECK ((starting_price > (0)::numeric))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_status" CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'closed'::character varying, 'cancelled'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" ADD CONSTRAINT "FK_bids_bidder" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" ADD CONSTRAINT "FK_bids_auction" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "FK_auctions_winner" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "FK_auctions_seller" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }
}
