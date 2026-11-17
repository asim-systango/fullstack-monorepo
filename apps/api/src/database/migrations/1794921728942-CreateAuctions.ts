import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuctions1794921728942 implements MigrationInterface {
  name = 'CreateAuctions1794921728942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create auctions table
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

        CONSTRAINT "PK_auctions"
          PRIMARY KEY ("id"),

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

    // 2. Seller foreign key
    await queryRunner.query(`
      ALTER TABLE "auctions"
      ADD CONSTRAINT "FK_auctions_seller"
      FOREIGN KEY ("seller_id")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    // 3. Winner foreign key
    await queryRunner.query(`
      ALTER TABLE "auctions"
      ADD CONSTRAINT "FK_auctions_winner"
      FOREIGN KEY ("winner_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Dropping the table also removes its foreign keys and CHECK constraints.
    await queryRunner.query(`DROP TABLE "auctions"`);
  }
}
