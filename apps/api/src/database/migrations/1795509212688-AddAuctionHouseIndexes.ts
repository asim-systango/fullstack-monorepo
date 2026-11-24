import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionHouseIndexes1795509212688 implements MigrationInterface {
  name = 'AddAuctionHouseIndexes1795509212688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_auctions_status_ends_at" ON "auctions" ("status", "ends_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_watchlists_auction_id" ON "watchlists" ("auction_id") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_bids_bidder_id" ON "bids" ("bidder_id") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_bids_auction_id" ON "bids" ("auction_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_bids_auction_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bids_bidder_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_watchlists_auction_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_auctions_status_ends_at"`);
  }
}
