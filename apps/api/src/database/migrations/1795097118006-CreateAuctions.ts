import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuctions1795097118006 implements MigrationInterface {
  name = 'CreateAuctions1795097118006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auctions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "category" character varying(100) NOT NULL, "starting_price" numeric(10,2) NOT NULL, "min_increment" numeric(10,2) NOT NULL, "current_price" numeric(10,2) NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'open', "seller_id" uuid NOT NULL, "winner_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_auctions_current_price" CHECK ("current_price" >= "starting_price"), CONSTRAINT "CHK_auctions_min_increment" CHECK ("min_increment" > 0), CONSTRAINT "CHK_auctions_starting_price" CHECK ("starting_price" > 0), CONSTRAINT "CHK_auctions_status" CHECK ("status" IN ('open', 'closed', 'cancelled')), CONSTRAINT "PK_87d2b34d4829f0519a5c5570368" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "FK_0cc14a58a02d6cf816e906d2c6b" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" ADD CONSTRAINT "FK_01f10a0683ea2e257d66b086b9f" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "FK_01f10a0683ea2e257d66b086b9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auctions" DROP CONSTRAINT "FK_0cc14a58a02d6cf816e906d2c6b"`,
    );
    await queryRunner.query(`DROP TABLE "auctions"`);
  }
}
