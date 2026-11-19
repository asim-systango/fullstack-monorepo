import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestoreAuctionBidChecks1795082465158 implements MigrationInterface {
  name = 'RestoreAuctionBidChecks1795082465158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_current_price" CHECK ("current_price" >= "starting_price")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_min_increment" CHECK ("min_increment" > 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_starting_price" CHECK ("starting_price" > 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "CHK_auctions_status" CHECK ("status" IN ('open', 'closed', 'cancelled'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bids" ADD CONSTRAINT "CHK_bids_bid_amount" CHECK ("bid_amount" > 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "CHK_bids_bid_amount"`);
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
  }
}
