import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWatchlists1795097169235 implements MigrationInterface {
  name = 'CreateWatchlists1795097169235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "watchlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "auction_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_1b7653e729fe5d8da420bdb406c" UNIQUE ("user_id", "auction_id"), CONSTRAINT "PK_aa3c717b50a10f7a435c65eda5a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlists" ADD CONSTRAINT "FK_3e8bccad3dcd75fa977892c54bb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlists" ADD CONSTRAINT "FK_5dda1097094861329f62fdac209" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "watchlists" DROP CONSTRAINT "FK_5dda1097094861329f62fdac209"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlists" DROP CONSTRAINT "FK_3e8bccad3dcd75fa977892c54bb"`,
    );
    await queryRunner.query(`DROP TABLE "watchlists"`);
  }
}
