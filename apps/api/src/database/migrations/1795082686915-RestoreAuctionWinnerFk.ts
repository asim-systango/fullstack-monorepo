import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestoreAuctionWinnerFk1795082686915 implements MigrationInterface {
  name = 'RestoreAuctionWinnerFk1795082686915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT IF EXISTS "FK_auctions_winner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "FK_auctions_winner" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT IF EXISTS "FK_auctions_winner"`,
    );
  }
}
