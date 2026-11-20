import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBids1795097147203 implements MigrationInterface {
  name = 'CreateBids1795097147203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bids" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "auction_id" uuid NOT NULL, "bidder_id" uuid NOT NULL, "bid_amount" numeric(10,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_bids_bid_amount" CHECK ("bid_amount" > 0), CONSTRAINT "PK_7950d066d322aab3a488ac39fe5" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(`DROP TABLE "bids"`);
  }
}
