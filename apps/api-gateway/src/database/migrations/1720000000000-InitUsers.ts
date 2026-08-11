import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsers1720000000000 implements MigrationInterface {
  name = 'InitUsers1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "first_name" character varying(50),
        "last_name" character varying(50),
        "name" character varying(120),
        "phone" character varying(20),
        "role" character varying(20) NOT NULL DEFAULT 'PATIENT',
        "is_active" boolean NOT NULL DEFAULT true,
        "email_verified" boolean NOT NULL DEFAULT false,
        "hashed_refresh_token" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Ensure columns exist if table was created by older schema version
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "first_name" character varying(50),
        ADD COLUMN IF NOT EXISTS "last_name" character varying(50),
        ADD COLUMN IF NOT EXISTS "phone" character varying(20),
        ADD COLUMN IF NOT EXISTS "avatar_url" text,
        ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "email_verified" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "hashed_refresh_token" text,
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
