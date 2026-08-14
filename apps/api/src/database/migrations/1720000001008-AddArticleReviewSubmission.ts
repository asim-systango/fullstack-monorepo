import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the review-submission pointer, kept deliberately separate from the
 * publish pointer: `submitted_*` records what the Author asked an Editor to look
 * at, `published_*` records what the public blog serves. Neither implies the other.
 */
export class AddArticleReviewSubmission1720000001008 implements MigrationInterface {
  name = 'AddArticleReviewSubmission1720000001008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "submitted_at" TIMESTAMPTZ
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "submitted_revision_id" uuid
    `);

    // RESTRICT matches published_revision_id: a referenced revision is history
    // and must not disappear from under the pointer.
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "FK_articles_submitted_revision_id"
      FOREIGN KEY ("submitted_revision_id")
      REFERENCES "revisions"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "CHK_articles_submitted_pair" CHECK (
        (
          "submitted_revision_id" IS NULL
          AND "submitted_at" IS NULL
        )
        OR (
          "submitted_revision_id" IS NOT NULL
          AND "submitted_at" IS NOT NULL
        )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_submitted_revision_id"
      ON "articles" ("submitted_revision_id")
      WHERE "submitted_revision_id" IS NOT NULL
    `);

    // Drives the editor review queue: submitted, and not already the live revision.
    await queryRunner.query(`
      CREATE INDEX "IDX_articles_review_queue"
      ON "articles" ("submitted_at")
      WHERE "submitted_revision_id" IS NOT NULL
        AND "submitted_revision_id" IS DISTINCT FROM "published_revision_id"
        AND "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_articles_review_queue"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_articles_submitted_revision_id"`);
    await queryRunner.query(`
      ALTER TABLE "articles"
      DROP CONSTRAINT "CHK_articles_submitted_pair"
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
      DROP CONSTRAINT "FK_articles_submitted_revision_id"
    `);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "submitted_revision_id"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "submitted_at"`);
  }
}
