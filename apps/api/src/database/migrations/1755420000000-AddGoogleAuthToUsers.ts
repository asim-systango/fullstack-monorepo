import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuthToUsers1755420000000 implements MigrationInterface {
  name = 'AddGoogleAuthToUsers1755420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password_hash" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "google_id" character varying(255)
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_google_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "google_id"
    `);
    await queryRunner.query(`
      UPDATE "users" SET "password_hash" = '' WHERE "password_hash" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password_hash" SET NOT NULL
    `);
  }
}
