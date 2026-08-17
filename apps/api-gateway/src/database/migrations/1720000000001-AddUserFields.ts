import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserFields1720000000001 implements MigrationInterface {
  name = 'AddUserFields1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "first_name" character varying(50),
        ADD COLUMN IF NOT EXISTS "last_name" character varying(50),
        ADD COLUMN IF NOT EXISTS "phone" character varying(20),
        ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "email_verified" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "hashed_refresh_token" text,
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "first_name",
        DROP COLUMN IF EXISTS "last_name",
        DROP COLUMN IF EXISTS "phone",
        DROP COLUMN IF EXISTS "is_active",
        DROP COLUMN IF EXISTS "email_verified",
        DROP COLUMN IF EXISTS "hashed_refresh_token",
        DROP COLUMN IF EXISTS "deleted_at";
    `);
  }
}
