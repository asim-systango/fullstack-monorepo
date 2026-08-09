import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cloudinary-backed media library (metadata only).
 * `uploader_id` is an opaque gateway user UUID — no FK to `users`.
 */
export class CreateMedia1720000001005 implements MigrationInterface {
  name = 'CreateMedia1720000001005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "uploader_id" uuid NOT NULL,
        "cloudinary_public_id" text NOT NULL,
        "resource_type" character varying(10) NOT NULL,
        "format" character varying(20) NOT NULL,
        "secure_url" text NOT NULL,
        "bytes" bigint NOT NULL,
        "width" integer,
        "height" integer,
        "duration_seconds" numeric(10, 3),
        "default_alt_text" character varying(255),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_media" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_media_cloudinary_asset" UNIQUE ("resource_type", "cloudinary_public_id"),
        CONSTRAINT "CHK_media_resource_type" CHECK (
          "resource_type" IN ('image', 'video')
        ),
        CONSTRAINT "CHK_media_bytes" CHECK ("bytes" >= 0),
        CONSTRAINT "CHK_media_dimensions" CHECK (
          ("width" IS NULL AND "height" IS NULL)
          OR ("width" > 0 AND "height" > 0)
        ),
        CONSTRAINT "CHK_media_duration" CHECK (
          "duration_seconds" IS NULL OR "duration_seconds" >= 0
        )
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_media_uploader_id" ON "media" ("uploader_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_media_deleted_at" ON "media" ("deleted_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_media_resource_type" ON "media" ("resource_type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"`);
  }
}
