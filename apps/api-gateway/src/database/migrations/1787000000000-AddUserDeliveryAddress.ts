import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDeliveryAddress1787000000000 implements MigrationInterface {
  name = 'AddUserDeliveryAddress1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "delivery_address" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "delivery_address"
    `);
  }
}
