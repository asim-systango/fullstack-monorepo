import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Switch revisions from markdown `body` TEXT to block `content` JSONB,
 * and add optional cover FK to media.
 */
export class AlterRevisionsToContent1720000001006 implements MigrationInterface {
  name = 'AlterRevisionsToContent1720000001006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "revisions"
      ADD "content" jsonb
    `);

    // Preserve any existing draft rows as a single paragraph block.
    await queryRunner.query(`
      UPDATE "revisions"
      SET "content" = jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid()::text,
          'type', 'paragraph',
          'markdown', COALESCE("body", '')
        )
      )
      WHERE "content" IS NULL
    `);

    await queryRunner.query(`ALTER TABLE "revisions" DROP COLUMN "body"`);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      ALTER COLUMN "content" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      ADD CONSTRAINT "CHK_revision_content_is_array" CHECK (
        jsonb_typeof("content") = 'array'
        AND jsonb_array_length("content") > 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      ADD "cover_media_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      ADD CONSTRAINT "FK_revisions_cover_media_id"
      FOREIGN KEY ("cover_media_id")
      REFERENCES "media"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_revisions_article_id"`);
    await queryRunner.query(`
      CREATE INDEX "IDX_revisions_article_id_created_at"
      ON "revisions" ("article_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_revisions_cover_media_id"
      ON "revisions" ("cover_media_id")
      WHERE "cover_media_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_revisions_cover_media_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_revisions_article_id_created_at"`);
    await queryRunner.query(`
      CREATE INDEX "IDX_revisions_article_id" ON "revisions" ("article_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      DROP CONSTRAINT "FK_revisions_cover_media_id"
    `);
    await queryRunner.query(`ALTER TABLE "revisions" DROP COLUMN "cover_media_id"`);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      ADD "body" text
    `);

    await queryRunner.query(`
      UPDATE "revisions"
      SET "body" = COALESCE(
        (
          SELECT string_agg(elem->>'markdown', E'\\n\\n' ORDER BY ordinality)
          FROM jsonb_array_elements("content") WITH ORDINALITY AS t(elem, ordinality)
          WHERE elem->>'type' = 'paragraph'
        ),
        ''
      )
      WHERE "body" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      ALTER COLUMN "body" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "revisions"
      DROP CONSTRAINT "CHK_revision_content_is_array"
    `);
    await queryRunner.query(`ALTER TABLE "revisions" DROP COLUMN "content"`);
  }
}
