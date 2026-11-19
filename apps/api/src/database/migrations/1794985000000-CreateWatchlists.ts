import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWatchlists1794985000000 implements MigrationInterface {
  name = 'CreateWatchlists1794985000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "watchlists" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "auction_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "PK_watchlists"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_watchlists_user_auction"
          UNIQUE ("user_id", "auction_id")
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
    await queryRunner.query(`DROP TABLE "watchlists"`);
  }
}
